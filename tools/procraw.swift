// 把出图接口给的原图（绿幕、按格子排的分件/帧）处理成游戏用的横排图集，逻辑与 ChatGPT 页面里的 __procJob 一致：
// 切格 → 从格子边缘泛洪去绿幕 → 去绿边 → 每组按共同包围盒等比缩放、脚底对齐，输出 out×out 一格的横排 PNG。
// 用法：procraw <原图> <输出> <列> <行> <用到的格数> <每组格数> [单格边长=96]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let A=CommandLine.arguments
guard A.count>=7,let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:A[1]) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{print("用法：procraw 原图 输出 列 行 格数 每组格数 [边长]");exit(1)}
let cols=Int(A[3])!,rows=Int(A[4])!,used=Int(A[5])!,per=Int(A[6])!,out=A.count>7 ? Int(A[7])! : 96
let W=im.width,H=im.height,cw=W/cols,ch=H/rows
let cs=CGColorSpaceCreateDeviceRGB(),info=CGImageAlphaInfo.premultipliedLast.rawValue
var full=[UInt8](repeating:0,count:W*H*4)
CGContext(data:&full,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:info)!.draw(im,in:CGRect(x:0,y:0,width:W,height:H))

func key(_ a:inout [UInt8],_ w:Int,_ h:Int){
  func isG(_ p:Int)->Bool{let r=Int(a[p]),g=Int(a[p+1]),b=Int(a[p+2]);return g>100 && g*2>r*3 && g*2>b*3}
  var seen=[Bool](repeating:false,count:w*h),st:[Int]=[]
  for x in 0..<w{st.append(x);st.append((h-1)*w+x)};for y in 0..<h{st.append(y*w);st.append(y*w+w-1)}
  while let q=st.popLast(){if seen[q]{continue};seen[q]=true;if !isG(q*4){continue};a[q*4+3]=0;a[q*4]=0;a[q*4+1]=0;a[q*4+2]=0
    let x=q%w,y=q/w;if x>0{st.append(q-1)};if x<w-1{st.append(q+1)};if y>0{st.append(q-w)};if y<h-1{st.append(q+w)}}
  for q in 0..<w*h{let p=q*4;if a[p+3]==0{continue};let x=q%w,y=q/w
    let nb=(x>0&&a[p-1]==0)||(x<w-1&&a[p+7]==0)||(y>0&&a[p-w*4+3]==0)||(y<h-1&&a[p+w*4+3]==0)
    if nb&&a[p+1]>a[p]&&a[p+1]>a[p+2]{if a[p+1]>150&&a[p]<120{a[p+3]=0;a[p]=0;a[p+1]=0;a[p+2]=0}else{a[p+1]=max(a[p],a[p+2])}}}
  for p in stride(from:0,to:a.count,by:4) where a[p+1]>190&&a[p]<90&&a[p+2]<90{a[p+3]=0;a[p]=0;a[p+1]=0;a[p+2]=0}
}

struct B{var x0=Int.max,y0=Int.max,x1 = -1,y1 = -1}
var cells:[CGImage]=[],boxes:[B?]=[]
for c in 0..<used{let i=c%cols,r=c/cols;var a=[UInt8](repeating:0,count:cw*ch*4)
  for y in 0..<ch{let s=((r*ch+y)*W+i*cw)*4;a.replaceSubrange(y*cw*4..<(y+1)*cw*4,with:full[s..<s+cw*4])}
  key(&a,cw,ch)
  var b=B();let mg=Int((Double(cw)*0.015).rounded())
  // 格子线残留：边缘一圈直接清掉
  for y in 0..<ch{for x in 0..<cw where x<mg||y<mg||x>=cw-mg||y>=ch-mg{let p=(y*cw+x)*4;a[p]=0;a[p+1]=0;a[p+2]=0;a[p+3]=0}}
  for y in mg..<(ch-mg){for x in mg..<(cw-mg) where a[(y*cw+x)*4+3]>60{b.x0=min(b.x0,x);b.x1=max(b.x1,x);b.y0=min(b.y0,y);b.y1=max(b.y1,y)}}
  let ctx=CGContext(data:&a,width:cw,height:ch,bitsPerComponent:8,bytesPerRow:cw*4,space:cs,bitmapInfo:info)!
  cells.append(ctx.makeImage()!);boxes.append(b.x1<0 ? nil : b)}

let res=CGContext(data:nil,width:out*used,height:out,bitsPerComponent:8,bytesPerRow:out*used*4,space:cs,bitmapInfo:info)!
res.interpolationQuality = .high
var g=0
while g<used{let bs=boxes[g..<min(g+per,used)].compactMap{$0}
  if !bs.isEmpty{let X0=bs.map{$0.x0}.min()!,Y0=bs.map{$0.y0}.min()!,X1=bs.map{$0.x1}.max()!,Y1=bs.map{$0.y1}.max()!
    let sc=min(Double(out)*0.95/Double(X1-X0+1),Double(out)*0.95/Double(Y1-Y0+1)),cx=Double(X0+X1)/2
    for k in g..<min(g+per,used){res.saveGState();res.clip(to:CGRect(x:k*out,y:0,width:out,height:out))
      // CG 原点在左下：脚底（Y1）贴格子底边往上 1 像素
      let dx=Double(k*out)+Double(out)/2-cx*sc,dyTop=Double(out)-1-Double(Y1+1)*sc
      res.draw(cells[k],in:CGRect(x:dx,y:Double(out)-dyTop-Double(ch)*sc,width:Double(cw)*sc,height:Double(ch)*sc));res.restoreGState()}}
  g+=per}
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,res.makeImage()!,nil);CGImageDestinationFinalize(d)
