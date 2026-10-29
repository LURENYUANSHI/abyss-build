// 刀光、法术被截成直边（游戏里像方框）：把被截断的左/右边按距离向内淡出；顶边（头发）和底边（脚）不动。
// 运行时 raid_engine 的 edgeFade 只处理怪物图集，职业动作图靠这里。用法：edgefade 图集.png...（原地改写）
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let cs=CGColorSpaceCreateDeviceRGB(),info=CGImageAlphaInfo.premultipliedLast.rawValue
var n=0
for p in CommandLine.arguments.dropFirst(){
  guard let s=CGImageSourceCreateWithURL(URL(fileURLWithPath:p) as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(s,0,nil) else{continue}
  let W=im.width,H=im.height,m=max(3,H/10)
  var a=[UInt8](repeating:0,count:W*H*4)
  let ctx=CGContext(data:&a,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:info)!;ctx.draw(im,in:CGRect(x:0,y:0,width:W,height:H))
  for f in 0..<W/H{let x0=f*H
    // 内容最外侧一列（或最上一行）不透明像素很多、再往外是空的 = 被截断的直边（AI 照着参考图把刀光画成这样，不一定贴着格子边）
    var cc=[Int](repeating:0,count:H),rc=[Int](repeating:0,count:H)
    for y in 0..<H{for x in 0..<H where a[(y*W+x0+x)*4+3]>40{cc[x]+=1;rc[y]+=1}}
    guard let lx=cc.firstIndex(where:{$0>0}),let rx=cc.lastIndex(where:{$0>0}),let ty=rc.firstIndex(where:{$0>0}) else{continue}
    // 突变判定：最外侧一列 ≥6 个像素，且不少于往里 1~3 列最大值的一半（自然轮廓是越往外越少）
    func cut(_ v:[Int],_ e:Int,_ d:Int)->Bool{let inn=(1...3).map{v[max(0,min(H-1,e+d*$0))]}.max()!;return v[e]>=6&&Double(v[e])>=0.5*Double(inn)}
    let L=cut(cc,lx,1),R=cut(cc,rx,-1),T=false   // 顶边不判：头发顶部常是平的，会被误判成截断把头淡掉
    if !(T||L||R){continue};n+=1
    for y in 0..<H{for x in 0..<H{var e=m;if T{e=min(e,max(0,y-ty))};if L{e=min(e,max(0,x-lx))};if R{e=min(e,max(0,rx-x))}
      if e<m{let q=(y*W+x0+x)*4,k=Double(e)/Double(m);for c in 0..<4{a[q+c]=UInt8(Double(a[q+c])*k)}}}}}
  let out=CGContext(data:&a,width:W,height:H,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:info)!.makeImage()!
  let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:p) as CFURL,UTType.png.identifier as CFString,1,nil)!
  CGImageDestinationAddImage(d,out,nil);CGImageDestinationFinalize(d)}
print("淡出了 \(n) 帧")
