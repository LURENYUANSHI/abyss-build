// 高清立绘后处理：绿幕抠图 → 裁到人物 → 等比缩放到 高 H、脚底贴底居中 → 输出 JPEG，上半张是彩图（底为黑），下半张是透明度灰度图
// （本机写不了 WebP，PNG 太大；运行时把下半张的亮度拷进透明通道即可）
// 用法：portrait <原图> <输出.jpg> [宽=640] [高=960] [质量=0.82]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let A=CommandLine.arguments
guard A.count>=3,let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:A[1]) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{print("用法：portrait 原图 输出.jpg [宽] [高] [质量]");exit(1)}
let OW=A.count>3 ? Int(A[3])! : 640,OH=A.count>4 ? Int(A[4])! : 960,Q=A.count>5 ? Double(A[5])! : 0.82
let W=im.width,H=im.height,cs=CGColorSpaceCreateDeviceRGB(),info=CGImageAlphaInfo.premultipliedLast.rawValue
var a=[UInt8](repeating:0,count:W*H*4)
CGContext(data:&a,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:info)!.draw(im,in:CGRect(x:0,y:0,width:W,height:H))
// 绿幕：从四边泛洪（只吃连通的绿），再把贴边的绿溢色压掉
func isG(_ p:Int)->Bool{let r=Int(a[p]),g=Int(a[p+1]),b=Int(a[p+2]);return g>90 && g*10>r*14 && g*10>b*14}
var seen=[Bool](repeating:false,count:W*H),st:[Int]=[]
for x in 0..<W{st.append(x);st.append((H-1)*W+x)};for y in 0..<H{st.append(y*W);st.append(y*W+W-1)}
while let q=st.popLast(){if seen[q]{continue};seen[q]=true;if !isG(q*4){continue};a[q*4+3]=0
  let x=q%W,y=q/W;if x>0{st.append(q-1)};if x<W-1{st.append(q+1)};if y>0{st.append(q-W)};if y<H-1{st.append(q+W)}}
// 被包住的大块绿（腋下、弓弦里）也去掉
for q in 0..<W*H where a[q*4+3]>0{let p=q*4;if Int(a[p+1])>170&&Int(a[p])<110&&Int(a[p+2])<110{a[p+3]=0}}
// 边缘：与透明相邻的像素做半透明 + 去绿溢色
for _ in 0..<2{var b=a
  for q in 0..<W*H where a[q*4+3]==255{let x=q%W,y=q/W,p=q*4
    let nb=(x>0&&a[p-1]==0)||(x<W-1&&a[p+7]==0)||(y>0&&a[p-W*4+3]==0)||(y<H-1&&a[p+W*4+3]==0)
    if nb{b[p+3]=170;let m=max(a[p],a[p+2]);if a[p+1]>m{b[p+1]=m}}}
  a=b}
for p in stride(from:0,to:a.count,by:4) where a[p+3]>0{let m=max(a[p],a[p+2]);if Int(a[p+1])>Int(m)+30{a[p+1]=UInt8(Int(m)+30)}}
// 包围盒（忽略零星噪点：一行/列至少 3 个不透明像素）
var x0=W,x1 = -1,y0=H,y1 = -1
for y in 0..<H{var c=0;for x in 0..<W where a[(y*W+x)*4+3]>100{c+=1};if c>=3{y0=min(y0,y);y1=max(y1,y)}}
for x in 0..<W{var c=0;for y in 0..<H where a[(y*W+x)*4+3]>100{c+=1};if c>=3{x0=min(x0,x);x1=max(x1,x)}}
guard x1>x0,y1>y0 else{print("空图");exit(1)}
// 预乘 → 直接颜色（彩图要不带透明的颜色）
var col=[UInt8](repeating:0,count:W*H*4),alp=[UInt8](repeating:0,count:W*H*4)
for q in 0..<W*H{let p=q*4,al=Int(a[p+3]);if al>0{for k in 0..<3{col[p+k]=UInt8(min(255,Int(a[p+k])*255/al))}};col[p+3]=255;alp[p]=UInt8(al);alp[p+1]=UInt8(al);alp[p+2]=UInt8(al);alp[p+3]=255}
func img(_ d:inout [UInt8])->CGImage{CGContext(data:&d,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue)!.makeImage()!}
let ci=img(&col).cropping(to:CGRect(x:x0,y:y0,width:x1-x0+1,height:y1-y0+1))!,ai=img(&alp).cropping(to:CGRect(x:x0,y:y0,width:x1-x0+1,height:y1-y0+1))!
let bw=Double(x1-x0+1),bh=Double(y1-y0+1),sc=min(Double(OH)*0.97/bh,Double(OW)*0.98/bw),dw=bw*sc,dh=bh*sc,dx=(Double(OW)-dw)/2
let out=CGContext(data:nil,width:OW,height:OH*2,bitsPerComponent:8,bytesPerRow:OW*4,space:cs,bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue)!
out.setFillColor(red:0,green:0,blue:0,alpha:1);out.fill(CGRect(x:0,y:0,width:OW,height:OH*2));out.interpolationQuality = .high
// CG 原点在左下：上半张（彩图）占 y∈[OH,2OH)，下半张（透明度）占 [0,OH)；脚底贴各自半张的底边
out.draw(ci,in:CGRect(x:dx,y:Double(OH)+1,width:dw,height:dh))
out.draw(ai,in:CGRect(x:dx,y:1,width:dw,height:dh))
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[2]) as CFURL,UTType.jpeg.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,out.makeImage()!,[kCGImageDestinationLossyCompressionQuality:Q] as CFDictionary);CGImageDestinationFinalize(d)
