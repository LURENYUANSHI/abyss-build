// 重画后的帧按原图对齐写回：每组（per 帧）取原帧与新帧的共同包围盒，按原图身高等比缩放（宽度不出格），脚底与水平中心对齐原图。
// 这样游戏里的大小、锚点、体型都不变，只换画风。
// 用法：fitsheet <原图集> <新帧横排> <输出图集> <写入起始格> <每组帧数> [新帧序号,逗号分隔（默认全部）]
// 输出图集可以与原图集相同（原地替换这几格）。
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let A=CommandLine.arguments
func load(_ p:String)->CGImage?{guard let s=CGImageSourceCreateWithURL(URL(fileURLWithPath:p) as CFURL,nil) else{return nil};return CGImageSourceCreateImageAtIndex(s,0,nil)}
guard A.count>=6,let orig=load(A[1]),let nw=load(A[2]) else{print("用法：fitsheet 原图集 新帧 输出 起始格 每组帧数 [序号]");exit(1)}
let off=Int(A[4])!,per=Int(A[5])!
let S=orig.height,NS=nw.height,nNew=nw.width/NS
let pick=A.count>6 ? A[6].split(separator:",").map{Int($0)!} : Array(0..<nNew)
let cs=CGColorSpaceCreateDeviceRGB(),info=CGImageAlphaInfo.premultipliedLast.rawValue
func px(_ im:CGImage)->[UInt8]{var a=[UInt8](repeating:0,count:im.width*im.height*4);CGContext(data:&a,width:im.width,height:im.height,bitsPerComponent:8,bytesPerRow:im.width*4,space:cs,bitmapInfo:info)!.draw(im,in:CGRect(x:0,y:0,width:im.width,height:im.height));return a}
let oa=px(orig),na=px(nw)
// 帧 i 的不透明包围盒（行号自上而下）
func box(_ a:[UInt8],_ W:Int,_ s:Int,_ i:Int)->(Int,Int,Int,Int)?{var x0=s,y0=s,x1 = -1,y1 = -1
  for y in 0..<s{for x in 0..<s where a[(y*W+i*s+x)*4+3]>60{x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)}}
  return x1<0 ? nil : (x0,y0,x1,y1)}
func uni(_ b:[(Int,Int,Int,Int)])->(Int,Int,Int,Int)?{b.isEmpty ? nil : (b.map{$0.0}.min()!,b.map{$0.1}.min()!,b.map{$0.2}.max()!,b.map{$0.3}.max()!)}
// 输出：以原图集为底（若输出已存在且不同于原图集，就以输出为底，便于多次写入同一张）
let base=FileManager.default.fileExists(atPath:A[3]) ? (load(A[3]) ?? orig) : orig
let W=base.width
let ctx=CGContext(data:nil,width:W,height:S,bitsPerComponent:8,bytesPerRow:W*4,space:cs,bitmapInfo:info)!
ctx.draw(base,in:CGRect(x:0,y:0,width:W,height:S));ctx.interpolationQuality = .high
var g=0
while g<pick.count{let idx=Array(pick[g..<min(g+per,pick.count)])
  let ob=uni((0..<idx.count).compactMap{box(oa,orig.width,S,off+g+$0)}),nb=uni(idx.compactMap{box(na,nw.width,NS,$0)})
  if let nb=nb{
    let o=ob ?? (S/8,S/8,S*7/8,S-2)
    let nwid=Double(nb.2-nb.0+1),nhei=Double(nb.3-nb.1+1),ohei=Double(o.3-o.1+1)
    // 宽度上限按单帧最宽算（整组并集会被刀光等特效撑宽，整组缩小）；个别仍出格的帧单独平移回格内
    let fb=idx.map{box(na,nw.width,NS,$0)}
    let maxW=Double(fb.compactMap{$0}.map{$0.2-$0.0+1}.max() ?? Int(nwid))
    // 身高按各帧身高的中位数对齐（个别帧头顶有特效会把并集撑高、整组变矮）；最高的一帧仍要放得进格子
    func med(_ v:[Int])->Double{let t=v.sorted();return t.isEmpty ? 0 : Double(t[t.count/2])}
    let oh=med((0..<idx.count).compactMap{box(oa,orig.width,S,off+g+$0)}.map{$0.3-$0.1+1}),nh=med(fb.compactMap{$0}.map{$0.3-$0.1+1})
    let maxH=Double(fb.compactMap{$0}.map{nb.3-$0.1+1}.max() ?? Int(nhei))
    let sc=min(oh>0&&nh>0 ? oh/nh : ohei/nhei,Double(S-2)/maxW,(Double(o.3)-1)/maxH)
    let cx=Double(o.0+o.2+1)/2,bottom=Double(o.3+1)
    for (k,i) in idx.enumerated(){let cell=off+g+k
      ctx.clear(CGRect(x:cell*S,y:0,width:S,height:S))
      guard let cut=nw.cropping(to:CGRect(x:i*NS+nb.0,y:nb.1,width:nb.2-nb.0+1,height:nb.3-nb.1+1)) else{continue}
      let w=nwid*sc,h=nhei*sc,top=bottom-h
      var left=Double(cell*S)+cx-w/2
      if let b=fb[k]{let l=left+Double(b.0-nb.0)*sc,r=left+Double(b.2-nb.0+1)*sc,lo=Double(cell*S)+1,hi=Double(cell*S+S)-1
        if l<lo{left+=lo-l}else if r>hi{left-=r-hi}}
      ctx.saveGState();ctx.clip(to:CGRect(x:cell*S,y:0,width:S,height:S))
      ctx.draw(cut,in:CGRect(x:left,y:Double(S)-top-h,width:w,height:h));ctx.restoreGState()}}
  g+=per}
let d=CGImageDestinationCreateWithURL(URL(fileURLWithPath:A[3]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(d,ctx.makeImage()!,nil);CGImageDestinationFinalize(d)
