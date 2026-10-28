// 把美术 PNG 转成 256 色调色板 PNG（PNG8 + tRNS），像素风不抖动，体积通常降到 1/3 左右。
// 用法：swiftc -O tools/png8.swift -o /tmp/png8 && /tmp/png8 art/*.png
// 必须在 artprep 之后跑（artprep 会按 32 位重写）。只有变小才覆盖原文件。
import Foundation
import CoreGraphics
import ImageIO
import Compression

func load(_ url:URL)->(w:Int,h:Int,px:[UInt8])?{
  guard let src=CGImageSourceCreateWithURL(url as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{return nil}
  let w=im.width,h=im.height;var px=[UInt8](repeating:0,count:w*h*4)
  let ctx=CGContext(data:&px,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(im,in:CGRect(x:0,y:0,width:w,height:h))
  for i in stride(from:0,to:px.count,by:4){let a=Int(px[i+3]);if a>0&&a<255{for k in 0..<3{px[i+k]=UInt8(min(255,Int(px[i+k])*255/a))}}}
  return (w,h,px)
}

// 中位切分：每次切开“范围 × 像素数”最大的盒子，取加权中位
func palette(_ hist:[(c:[Int],n:Int)],_ k:Int)->[[Int]]{
  var boxes:[[(c:[Int],n:Int)]]=[hist]
  func score(_ b:[(c:[Int],n:Int)])->(Double,Int){var best=0,ch=0;for d in 0..<4{let lo=b.map{$0.c[d]}.min()!,hi=b.map{$0.c[d]}.max()!;if hi-lo>best{best=hi-lo;ch=d}};return (Double(best)*log(Double(b.reduce(0){$0+$1.n})+1),ch)}
  while boxes.count<k{
    var bi = -1,bs=0.0,bc=0
    for (i,b) in boxes.enumerated() where b.count>1{let (s,c)=score(b);if s>bs{bs=s;bi=i;bc=c}}
    if bi<0{break}
    let b=boxes[bi].sorted{$0.c[bc]<$1.c[bc]},tot=b.reduce(0){$0+$1.n};var acc=0,cut=1
    for (i,e) in b.enumerated(){acc+=e.n;if acc*2>=tot{cut=max(1,min(b.count-1,i+1));break}}
    boxes[bi]=Array(b[..<cut]);boxes.append(Array(b[cut...]))
  }
  return boxes.map{b in let n=Double(b.reduce(0){$0+$1.n});return (0..<4).map{d in Int((Double(b.reduce(0){$0+$1.c[d]*$1.n})/n).rounded())}}
}

var crcT=[UInt32](repeating:0,count:256)
for n in 0..<256{var c=UInt32(n);for _ in 0..<8{c=(c&1) != 0 ? 0xEDB88320^(c>>1) : c>>1};crcT[n]=c}
func crc(_ d:[UInt8])->UInt32{var c:UInt32=0xFFFFFFFF;for b in d{c=crcT[Int((c^UInt32(b))&0xFF)]^(c>>8)};return c^0xFFFFFFFF}
func be(_ v:UInt32)->[UInt8]{[UInt8(v>>24),UInt8((v>>16)&0xFF),UInt8((v>>8)&0xFF),UInt8(v&0xFF)]}
func chunk(_ t:String,_ d:[UInt8])->[UInt8]{let td=Array(t.utf8)+d;return be(UInt32(d.count))+td+be(crc(td))}
func zlib(_ raw:[UInt8])->[UInt8]{
  var out=[UInt8](repeating:0,count:raw.count+1024)
  let n=out.withUnsafeMutableBufferPointer{o in raw.withUnsafeBufferPointer{i in compression_encode_buffer(o.baseAddress!,o.count,i.baseAddress!,i.count,nil,COMPRESSION_ZLIB)}}
  var a:UInt32=1,b:UInt32=0;for x in raw{a=(a+UInt32(x))%65521;b=(b+a)%65521}
  return [0x78,0x9C]+out[..<n]+be((b<<16)|a)
}

func png8(_ w:Int,_ h:Int,_ px:[UInt8])->[UInt8]{
  var cnt:[UInt32:Int]=[:]
  for i in stride(from:0,to:px.count,by:4) where px[i+3]>0{let k=UInt32(px[i])<<24|UInt32(px[i+1])<<16|UInt32(px[i+2])<<8|UInt32(px[i+3]);cnt[k,default:0]+=1}
  let hist=cnt.map{(c:[Int((($0.key)>>24)&0xFF),Int(($0.key>>16)&0xFF),Int(($0.key>>8)&0xFF),Int($0.key&0xFF)],n:$0.value)}
  // 0 号固定为全透明
  let pal=[[0,0,0,0]]+(hist.isEmpty ? [] : palette(hist,255))
  var map:[UInt32:UInt8]=[:]
  for (k,_) in cnt{let c=[Int((k>>24)&0xFF),Int((k>>16)&0xFF),Int((k>>8)&0xFF),Int(k&0xFF)];var bi=1,bd=Int.max
    for j in 1..<pal.count{let p=pal[j];let d=(p[0]-c[0])*(p[0]-c[0])+(p[1]-c[1])*(p[1]-c[1])+(p[2]-c[2])*(p[2]-c[2])+2*(p[3]-c[3])*(p[3]-c[3]);if d<bd{bd=d;bi=j}}
    map[k]=UInt8(bi)}
  var raw=[UInt8]();raw.reserveCapacity((w+1)*h)
  for y in 0..<h{raw.append(0);for x in 0..<w{let i=(y*w+x)*4;if px[i+3]==0{raw.append(0)}else{raw.append(map[UInt32(px[i])<<24|UInt32(px[i+1])<<16|UInt32(px[i+2])<<8|UInt32(px[i+3])]!)}}}
  let ihdr=be(UInt32(w))+be(UInt32(h))+[8,3,0,0,0]
  return [0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]+chunk("IHDR",ihdr)+chunk("PLTE",pal.flatMap{[UInt8($0[0]),UInt8($0[1]),UInt8($0[2])]})+chunk("tRNS",pal.map{UInt8($0[3])})+chunk("IDAT",zlib(raw))+chunk("IEND",[])
}

var before=0,after=0
for path in CommandLine.arguments.dropFirst(){
  let url=URL(fileURLWithPath:path)
  guard let old=try? Data(contentsOf:url),let (w,h,px)=load(url) else{print("跳过",path);continue}
  let out=png8(w,h,px);before+=old.count
  // 自检：调色板图读回来尺寸一致
  if out.count<old.count{try! Data(out).write(to:url);guard let chk=load(url),chk.w==w,chk.h==h else{try! old.write(to:url);print("回滚",path);after+=old.count;continue};after+=out.count}else{after+=old.count}
}
print(String(format:"%.1fMB -> %.1fMB",Double(before)/1e6,Double(after)/1e6))
