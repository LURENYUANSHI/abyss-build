// 把横排图集里的若干帧排成网格（白底、放大），作为“按格重画”的参考图
// 用法：gridref <图集> <输出> <起始帧> <帧数> <列数> [放大=3]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let A=CommandLine.arguments
guard A.count>=6,let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:A[1]) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{exit(1)}
let s=im.height,f0=Int(A[3])!,n=Int(A[4])!,cols=Int(A[5])!,k=A.count>6 ? Int(A[6])! : 3,rows=(n+cols-1)/cols,o=s*k
let ctx=CGContext(data:nil,width:o*cols,height:o*rows,bitsPerComponent:8,bytesPerRow:o*cols*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(red:0,green:1,blue:0,alpha:1);ctx.fill(CGRect(x:0,y:0,width:o*cols,height:o*rows));ctx.interpolationQuality = .none
for i in 0..<n{if let c=im.cropping(to:CGRect(x:(f0+i)*s,y:0,width:s,height:s)){let cx=i%cols,cy=rows-1-i/cols;ctx.draw(c,in:CGRect(x:cx*o,y:cy*o,width:o,height:o))}}
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,ctx.makeImage()!,nil);CGImageDestinationFinalize(d)
