// 把一张纹理做成四边无缝：原图与“错开半张”的自身按到中心的距离混合，边缘取错开图（它的边来自原图中间，天然连续）
// 用法：seamless <输入> <输出> [边长=256]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let A=CommandLine.arguments
guard A.count>=3,let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:A[1]) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{exit(1)}
let n=A.count>3 ? Int(A[3])! : 256
let cs=CGColorSpaceCreateDeviceRGB(),info=CGImageAlphaInfo.premultipliedLast.rawValue
var a=[UInt8](repeating:0,count:n*n*4)
let ctx=CGContext(data:&a,width:n,height:n,bitsPerComponent:8,bytesPerRow:n*4,space:cs,bitmapInfo:info)!
ctx.interpolationQuality = .high
// 取中间的正方形缩放到 n×n
let s=min(im.width,im.height);ctx.draw(im.cropping(to:CGRect(x:(im.width-s)/2,y:(im.height-s)/2,width:s,height:s))!,in:CGRect(x:0,y:0,width:n,height:n))
var o=[UInt8](repeating:0,count:n*n*4)
for y in 0..<n{for x in 0..<n{
  let sx=(x+n/2)%n,sy=(y+n/2)%n
  // 权重：离中心越远越偏向错开图
  let dx=abs(Double(x)-Double(n)/2)/(Double(n)/2),dy=abs(Double(y)-Double(n)/2)/(Double(n)/2)
  let w=min(1,max(0,(max(dx,dy)-0.45)/0.5))
  for k in 0..<4{let p=Double(a[(y*n+x)*4+k]),q=Double(a[(sy*n+sx)*4+k]);o[(y*n+x)*4+k]=UInt8(max(0,min(255,(p*(1-w)+q*w).rounded())))}}}
let oc=CGContext(data:&o,width:n,height:n,bitsPerComponent:8,bytesPerRow:n*4,space:cs,bitmapInfo:info)!
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,oc.makeImage()!,nil);CGImageDestinationFinalize(d)
