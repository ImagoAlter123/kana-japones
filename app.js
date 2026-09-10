const $=id=>document.getElementById(id);
const readings='a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
const aliases={shi:['si'],chi:['ti'],tsu:['tu'],fu:['hu'],wo:['o']};
const makeKana=(chars,type)=>Array.from(chars).map((char,i)=>({char,type,answers:[readings[i],...(aliases[readings[i]]||[])],display:readings[i]}));
const hiragana=makeKana('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん','hiragana');
const katakana=makeKana('アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン','katakana');
const kanji=[['一','um|1'],['二','dois|2'],['三','três|3'],['四','quatro|4'],['五','cinco|5'],['六','seis|6'],['七','sete|7'],['八','oito|8'],['九','nove|9'],['十','dez|10'],['百','cem|100'],['千','mil|1000'],['日','sol|dia'],['月','lua|mês'],['火','fogo'],['水','água'],['木','árvore|madeira'],['金','ouro|dinheiro|metal'],['土','terra|solo'],['山','montanha'],['川','rio'],['人','pessoa|ser humano'],['口','boca'],['目','olho|olhos'],['耳','orelha|ouvido'],['手','mão'],['足','pé|perna'],['大','grande'],['小','pequeno'],['中','meio|centro|dentro']].map(([char,a])=>({char,type:'kanji',answers:a.split('|'),display:a.split('|').filter(x=>!/^\d+$/.test(x)).join(' / ')}));
const sets={hiragana,katakana,kanji,mixed:[...hiragana,...katakana,...kanji]};
const titles={hiragana:'HIRAGANA',katakana:'KATAKANA',kanji:'KANJI BÁSICO'};
let mode='hiragana',current=null,answered=false,hits=0,total=0,bag=[];
let area='practice',level='1';
const sessions={};
function pool(){return area==='practice'?sets[mode]:level==='all'?kanjiLevels.flatMap(l=>l.entries):kanjiLevels[Number(level)-1].entries;}
function sessionKey(){return area==='practice'?'practice':'kanji-'+level;}
function saveSession(){sessions[sessionKey()]={hits,total};}
function restoreSession(){({hits,total}=sessions[sessionKey()]||{hits:0,total:0});bag=[];current=null;score();next();}
function normalize(s){return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');}
function refill(){bag=[...pool()];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(current&&bag[bag.length-1]===current)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}
function score(){$('hits').textContent=hits;$('total').textContent=total;$('accuracy').textContent=total?Math.round(hits/total*100)+'%':'—';}
function next(){if(!bag.length)refill();current=bag.pop();answered=false;const isKanji=current.type==='kanji';$('character').textContent=current.char;$('category').textContent=(area==='kanji'?'KANJI · NÍVEL '+current.level:titles[current.type]);$('counter').textContent=pool().length+' caracteres';$('prompt').textContent=isKanji?'Qual é o significado em português?':'Qual é a leitura em romaji?';$('response').placeholder=isKanji?'Digite o significado':'Digite a leitura';$('hint').textContent=isKanji?'Basta um significado. Acentos são opcionais.':'Use letras latinas, como a, ka ou shi.';$('response').value='';$('response').disabled=false;$('response').className='';$('check').disabled=false;$('next').hidden=true;$('reveal').hidden=area!=='kanji';$('feedback').className='';$('feedback').textContent='Observe o caractere e tente lembrar.';}
function answer(reveal=false){if(answered)return;const value=normalize($('response').value);if(!value&&!reveal){$('feedback').textContent='Digite uma resposta para conferir.';$('response').focus();return;}answered=true;total++;const correct=!reveal&&current.answers.some(a=>normalize(a)===value);if(correct)hits++;score();$('response').disabled=true;$('check').disabled=true;$('response').className=correct?'correct':'wrong';$('feedback').className=correct?'success':'error';$('feedback').textContent=(correct?'Isso! ':'A resposta é ')+current.display+'.';$('reveal').hidden=true;$('next').hidden=false;$('next').focus();}
$('form').onsubmit=e=>{e.preventDefault();answer();};$('next').onclick=()=>{next();$('response').focus();};document.querySelectorAll('input[name="mode"]').forEach(r=>r.onchange=()=>{mode=r.value;bag=[];next();$('response').focus();});$('reset').onclick=()=>{hits=0;total=0;bag=[];score();next();$('response').focus();};

function updateArea(){const course=area==='kanji';$('original-modes').hidden=course;$('level-controls').hidden=!course;$('tab-practice').setAttribute('aria-selected',String(!course));$('tab-kanji').setAttribute('aria-selected',String(course));$('tab-practice').tabIndex=course?-1:0;$('tab-kanji').tabIndex=course?0:-1;$('study-panel').setAttribute('aria-labelledby',course?'tab-kanji':'tab-practice');$('level-description').textContent=level==='all'?'Revisão completa: 150 kanji dos cinco níveis.':'30 kanji · '+kanjiLevels[Number(level)-1].description;$('footnote').textContent=course?'Os acertos são separados por nível nesta sessão. Os significados podem variar conforme a palavra; basta uma das respostas aceitas.':'Kana: os 46 caracteres básicos de cada alfabeto. Kanji: 30 significados iniciais em português.';}
function changeArea(target){if(area===target)return;saveSession();area=target;updateArea();restoreSession();}
$('tab-practice').onclick=()=>changeArea('practice');$('tab-kanji').onclick=()=>changeArea('kanji');
['tab-practice','tab-kanji'].forEach((id,i)=>$(id).onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?1:1-i;changeArea(target?'kanji':'practice');$(target?'tab-kanji':'tab-practice').focus();});
$('level').onchange=()=>{saveSession();level=$('level').value;updateArea();restoreSession();$('response').focus();};
$('reveal').onclick=()=>answer(true);
updateArea();next();
