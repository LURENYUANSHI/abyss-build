// 美术资源离线预处理：swift tools/artprep.swift [art目录] [--dry]
// 精灵图集（横排正方形帧）按动作组处理：清理半透明残渣 / 串格碎片 / 绿边，同组帧统一缩放、脚底贴底、按腿脚区域水平对齐；
// 特效图集：去近黑底并柔化四边。输出覆盖原图，问题清单写到 art/_report.json（截断、空帧、组内尺寸漂移）。
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let dir=CommandLine.arguments.count>1 && !CommandLine.arguments[1].hasPrefix("--") ? CommandLine.arguments[1] : "art"
let dry=CommandLine.arguments.contains("--dry")

// 每组帧数：首领 12 帧 z 表、旧首领 4、小怪 6 帧 x 表、旧小怪 3、变身/召唤物 1、机关 2、职业走路 6；fx 为特效
func kind(_ n:String)->(per:Int,fx:Bool)?{
  if n.hasPrefix("bosses_fx") || n.hasPrefix("fx_raid") { return (1,true) }
  if n.hasPrefix("bosses_") { return (n.hasSuffix("z") ? 12 : 4,false) }
  if n.hasPrefix("mobs_") { return (n.hasSuffix("x") ? 6 : 3,false) }
  if n.hasPrefix("adds_") { return (1,false) }
  if n.hasPrefix("props_") { return (2,false) }
  if n.hasPrefix("walk_") { return (6,false) }
  return nil
}

func load(_ url:URL)->(w:Int,h:Int,px:[UInt8])?{
  guard let src=CGImageSourceCreateWithURL(url as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{return nil}
  let w=im.width,h=im.height;var px=[UInt8](repeating:0,count:w*h*4)
  let ctx=CGContext(data:&px,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(im,in:CGRect(x:0,y:0,width:w,height:h))
  // 反预乘，后面按直通 alpha 处理
  for i in stride(from:0,to:px.count,by:4){let a=Int(px[i+3]);if a>0&&a<255{for k in 0..<3{px[i+k]=UInt8(min(255,Int(px[i+k])*255/a))}}}
  return (w,h,px)
}
func save(_ url:URL,_ w:Int,_ h:Int,_ px:[UInt8]){
  var p=px;for i in stride(from:0,to:p.count,by:4){let a=Int(p[i+3]);if a<255{for k in 0..<3{p[i+k]=UInt8(Int(p[i+k])*a/255)}}}
  let ctx=CGContext(data:&p,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
  let im=ctx.makeImage()!;let d=CGImageDestinationCreateWithURL(url as CFURL,UTType.png.identifier as CFString,1,nil)!;CGImageDestinationAddImage(d,im,nil);CGImageDestinationFinalize(d)
}

struct Box{var x0=Int.max,y0=Int.max,x1 = -1,y1 = -1;var empty:Bool{x1<0};var w:Int{x1-x0+1};var h:Int{y1-y0+1}}

// 一帧（s×s，取自整图 px 的第 f 格）
func frame(_ px:[UInt8],_ W:Int,_ s:Int,_ f:Int)->[UInt8]{var o=[UInt8](repeating:0,count:s*s*4);for y in 0..<s{let a=(y*W+f*s)*4;o.replaceSubrange(y*s*4..<(y+1)*s*4,with:px[a..<a+s*4])};return o}
func put(_ px:inout [UInt8],_ W:Int,_ s:Int,_ f:Int,_ o:[UInt8]){for y in 0..<s{let a=(y*W+f*s)*4;px.replaceSubrange(a..<a+s*4,with:o[y*s*4..<(y+1)*s*4])}}

// 精灵帧清理：去极淡像素、只保留大连通块（去掉串格碎片）、去绿边
func cleanSprite(_ o:inout [UInt8],_ s:Int){
  for i in stride(from:0,to:o.count,by:4) where o[i+3]<24 {o[i+3]=0}
  var lab=[Int](repeating:-1,count:s*s),sizes=[Int]();var st=[Int]()
  for q in 0..<s*s where o[q*4+3]>0&&lab[q]<0{let id=sizes.count;var n=0;st.append(q);lab[q]=id
    while let c=st.popLast(){n+=1;let x=c%s,y=c/s
      for (dx,dy) in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)]{let nx=x+dx,ny=y+dy;if nx<0||ny<0||nx>=s||ny>=s{continue};let nq=ny*s+nx;if lab[nq]<0&&o[nq*4+3]>0{lab[nq]=id;st.append(nq)}}}
    sizes.append(n)}
  let big=sizes.max() ?? 0
  for q in 0..<s*s where lab[q]>=0 && sizes[lab[q]]<max(12,big/40){o[q*4+3]=0}
  for q in 0..<s*s where o[q*4+3]>0{let p=q*4;let r=Int(o[p]),g=Int(o[p+1]),b=Int(o[p+2]);if g>r+20&&g>b+20{o[p+1]=UInt8(max(r,b))}}
}
// 特效帧清理：近黑去掉，四边柔化，避免看出方框
func cleanFx(_ o:inout [UInt8],_ s:Int){let m=Double(s)*0.14
  for y in 0..<s{for x in 0..<s{let p=(y*s+x)*4;if o[p+3]==0{continue};let l=max(o[p],o[p+1],o[p+2]);if l<34||o[p+3]<26{o[p+3]=0;continue}
    let e=Double(min(x,y,s-1-x,s-1-y));if e<m{o[p+3]=UInt8(Double(o[p+3])*pow(e/m,1.5))}}}}

func bbox(_ o:[UInt8],_ s:Int)->Box{var b=Box();for y in 0..<s{for x in 0..<s where o[(y*s+x)*4+3]>60{b.x0=min(b.x0,x);b.x1=max(b.x1,x);b.y0=min(b.y0,y);b.y1=max(b.y1,y)}};return b}
// 腿脚区域（包围盒底部 25%）的水平中心：攻击时武器伸出去也不会把身体带偏
func footX(_ o:[UInt8],_ s:Int,_ b:Box)->Double{let y0=b.y1-max(1,b.h/4);var sx=0.0,n=0.0;for y in y0...b.y1{for x in b.x0...b.x1 where o[(y*s+x)*4+3]>60{sx+=Double(x);n+=1}};return n>0 ? sx/n : Double(b.x0+b.x1)/2}

// 把帧内容按比例 k 缩放，并平移使脚底 = s-2、腿脚中心 = s/2
func place(_ o:[UInt8],_ s:Int,_ b:Box,_ fx:Double,_ k:Double)->[UInt8]{var r=[UInt8](repeating:0,count:s*s*4)
  let tx=Double(s)/2-fx*k,ty=Double(s-2)-Double(b.y1+1)*k
  for y in 0..<s{for x in 0..<s{let sxp=(Double(x)+0.5-tx)/k,syp=(Double(y)+0.5-ty)/k;let ix=Int(sxp.rounded(.down)),iy=Int(syp.rounded(.down))
    if ix<0||iy<0||ix>=s||iy>=s{continue};let p=(iy*s+ix)*4,q=(y*s+x)*4;r[q]=o[p];r[q+1]=o[p+1];r[q+2]=o[p+2];r[q+3]=o[p+3]}}
  return r}

var report=[[String:Any]]()
let files=try FileManager.default.contentsOfDirectory(atPath:dir).filter{$0.hasSuffix(".png")}.sorted()
var done=0
for f in files{let name=String(f.dropLast(4));guard let K=kind(name) else{continue}
  let url=URL(fileURLWithPath:dir).appendingPathComponent(f);guard var img=load(url) else{continue}
  let s=img.h,n=img.w/s;if n<1||img.w%s != 0 {report.append(["sheet":name,"issue":"宽度不是帧高的整数倍"]);continue}
  var issues=[String]()
  for g in stride(from:0,to:n,by:K.per){let cnt=min(K.per,n-g);var fr=(0..<cnt).map{frame(img.px,img.w,s,g+$0)}
    if K.fx{for i in 0..<cnt{cleanFx(&fr[i],s);put(&img.px,img.w,s,g+i,fr[i])};continue}
    for i in 0..<cnt{cleanSprite(&fr[i],s)}
    let bs=fr.map{bbox($0,s)}
    for (i,b) in bs.enumerated(){if b.empty{issues.append("第\(g+i)帧空白");continue}
      if b.x0<=1||b.x1>=s-2||b.y0<=1 {issues.append("第\(g+i)帧贴边，疑似被截断")}}
    let ok=bs.filter{!$0.empty};if ok.isEmpty{continue}
    let mh=ok.map{$0.h}.max()!,mw=ok.map{$0.w}.max()!,minh=ok.map{$0.h}.min()!
    if K.per>1 && Double(minh)<Double(mh)*0.6 {issues.append("第\(g)组帧高差异大（\(minh)~\(mh)）")}
    let k=min(1.0,Double(s)*0.94/Double(mh),Double(s)*0.94/Double(mw))   // 同组统一缩放（只缩不放）
    for i in 0..<cnt where !bs[i].empty{put(&img.px,img.w,s,g+i,place(fr[i],s,bs[i],footX(fr[i],s,bs[i]),k))}}
  if !issues.isEmpty{report.append(["sheet":name,"issues":issues])}
  if !dry{save(url,img.w,img.h,img.px)};done+=1}
let js=try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys])
try js.write(to:URL(fileURLWithPath:dir).appendingPathComponent("_report.json"))
print("处理 \(done) 张图集，\(report.count) 张有问题 → \(dir)/_report.json")
