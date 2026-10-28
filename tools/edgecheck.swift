// 找出被格子边截断的分件：非特效部件在格子边上有不透明像素就算截断，列出要重画的图集。
// 用法：swiftc -O tools/edgecheck.swift -o /tmp/edgecheck && /tmp/edgecheck art/rig*.png
import Foundation
import CoreGraphics
import ImageIO
func load(_ url:URL)->(w:Int,h:Int,px:[UInt8])?{
  guard let src=CGImageSourceCreateWithURL(url as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{return nil}
  let w=im.width,h=im.height;var px=[UInt8](repeating:0,count:w*h*4)
  let ctx=CGContext(data:&px,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(im,in:CGRect(x:0,y:0,width:w,height:h));return (w,h,px)}
// 每种分件图最后 2 格是特效（挥砍弧 / 光环 / 火花），运行时会渐隐，不算
var bad:[String]=[]
for path in CommandLine.arguments.dropFirst(){
  guard let (w,h,px)=load(URL(fileURLWithPath:path)) else{continue}
  let n=w/h,fxFrom=n-2;var cut:[Int]=[]
  for f in 0..<min(n,fxFrom){var e=0
    for i in 0..<h{for (x,y) in [(f*h+i,0),(f*h+i,h-1),(f*h,i),(f*h+h-1,i)] where px[(y*w+x)*4+3]>100{e+=1}}
    if e>3{cut.append(f)}}
  if !cut.isEmpty{bad.append(path);print((path as NSString).lastPathComponent,"截断部件",cut)}
}
print("共",bad.count,"张需要重画")
