// 从原逐帧图集里裁出几帧拼成参考图（给生图时附上，保证分件和原形象一致）
// 用法：refcrop <图集> <输出> <帧号,帧号,...> [放大倍数=3]
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let A=CommandLine.arguments
guard A.count>=4,let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:A[1]) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{exit(1)}
let s=im.height,k=A.count>4 ? Int(A[4])! : 3,fs=A[3].split(separator:",").compactMap{Int($0)}.filter{($0+1)*s<=im.width}
guard !fs.isEmpty else{exit(2)}
let o=s*k,ctx=CGContext(data:nil,width:o*fs.count,height:o,bitsPerComponent:8,bytesPerRow:o*fs.count*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(red:1,green:1,blue:1,alpha:1);ctx.fill(CGRect(x:0,y:0,width:o*fs.count,height:o));ctx.interpolationQuality = .none
for (i,f) in fs.enumerated(){if let c=im.cropping(to:CGRect(x:f*s,y:0,width:s,height:s)){ctx.draw(c,in:CGRect(x:i*o,y:0,width:o,height:o))}}
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,ctx.makeImage()!,nil);CGImageDestinationFinalize(d)
