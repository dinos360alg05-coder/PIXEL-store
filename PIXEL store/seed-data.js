// Local demo catalog: 8 bilingual entries for each of the five storefront departments.
(() => {
  const groups = [
    ['pc-accessories','PC Accessories','ملحقات الكمبيوتر',['PixelForge Mechanical Keyboard','Arc Mouse Pro','Neon XL Mousepad','Pulse Studio Headset','StreamCam HD Webcam','Vox USB Microphone','Link braided cable','Arc Wireless Controller']],
    ['games','Games & Gift Cards','الألعاب وبطاقات الهدايا',['Starbound PC Key','Neon Drift Deluxe','Kingdoms of Ash','Rift Runner 2','PlayStation Store Card','Xbox Game Pass Card','Steam Wallet Code','Pixel Quest Collection']],
    ['pc-builds','PC Components','مكونات الكمبيوتر',['Forge B650 Motherboard','Photon RTX 4060 GPU','Core i5 14400F CPU','16GB DDR5 Memory Kit','1TB NVMe SSD','650W Bronze PSU','Airflow Mid Tower Case','Frost 240 Liquid Cooler']],
    ['phones','Phones','الهواتف',['Nova X Pro 256GB','Orbit S 128GB','Pixel One 256GB','Nova Lite 128GB','Galaxy A55 256GB','iPhone 15 128GB','Rift Phone 12 256GB','Orbit Flip 256GB']],
    ['phone-accessories','Phone Accessories','ملحقات الهاتف',['Armor Case — Clear','65W Fast Charger','USB-C Braided Cable','Tempered Glass Duo','Power Bank 20000mAh','Wave Buds Wireless','MagSafe Wallet Stand','Car Charge Dock']]
  ];
  const brands=['PIXELFORGE','NOVA','ORBIT','NEON LABS'];
  const icons=['⌨','▣','▤','◉','▧','♬','⌁','◈'];
  const products=[]; let id=1;
  for(const [category,nameEn,nameAr,names] of groups) names.forEach((name,i)=>{
    const price=[18500,32000,12500,41000,28000,36000,7500,24000][i] * (category==='phones'?4:category==='pc-builds'?2:1);
    const p={id:String(id++),slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),category,subcategory:nameEn,brand:brands[i%brands.length],name_en:name,name_ar:`${nameAr} ${i+1}`,description_en:`Built for dependable everyday performance. Tested, packed and ready to ship from Pixel Store.`,description_ar:`منتج موثوق للاستخدام اليومي، جاهز للشحن من متجر بيكسل.`,price,old_price:i%3===1?Math.round(price*1.15):null,stock:i===7?0:4+i*2,rating:4.4+(i%6)/10,badges:i===0?['NEW']:i===2?['DEAL']:[],images:[],variants:category==='phones'?[{name:'Storage',values:['128GB','256GB'],prices:[0,18000],stock:[3,5]},{name:'Color',values:['Midnight','Silver','Ocean'],prices:[0,0,0],stock:[4,2,3]}]:[{name:'Color',values:['Black','White'],prices:[0,0],stock:[4,3]}],specs:{Category:nameEn,Brand:brands[i%brands.length],Warranty:'12 months'},tags:[nameEn.toLowerCase()],featured:i<2,is_active:true,icon:icons[i]};
    if(category==='phones')Object.assign(p.specs,{RAM:['8GB','12GB','16GB'][i%3],Storage:['128GB','256GB','512GB'][i%3],Color:['Midnight','Silver','Ocean'][i%3]});
    if(category==='games')Object.assign(p.specs,{Platform:['PC','PlayStation','Xbox'][i%3],Genre:['Action','Racing','Adventure','RPG'][i%4]});
    if(category==='phone-accessories')Object.assign(p.specs,{Compatible:['Universal','iPhone 15','Galaxy S24'][i%3],Type:['Case','Charger','Audio','Power'][i%4]});
    if(category==='pc-accessories')Object.assign(p.specs,{Type:['Keyboard','Mouse','Audio','Streaming'][i%4],Connection:i%2?'Wireless':'Wired'});
    if(category==='pc-builds')Object.assign(p.specs,{Type:['Motherboard','Graphics','Processor','Memory','Storage','Power','Case','Cooling'][i],Socket:i%2?'AM5':'LGA1700'});
    products.push(p);
  });
  products.push({id:'41',slug:'steam-account-meccha-chameleon',category:'games',subcategory:'Steam Accounts',brand:'Steam',name_en:'Steam Account — Meccha Chameleon',name_ar:'حساب ستيم — Meccha Chameleon',description_en:'Steam account that includes Meccha Chameleon.',description_ar:'حساب ستيم يتضمن لعبة Meccha Chameleon.',price:300,old_price:null,stock:12,rating:0,badges:['NEW'],images:['assets/chameleon-cover.jpg'],variants:[],specs:{Platform:'Steam',Game:'Meccha Chameleon',Type:'Game account'},tags:['steam','account','meccha','chameleon'],featured:true,is_active:true,icon:'♟'});
  window.SEED_PRODUCTS=products;
  window.SEED_CATEGORIES=groups.map(([slug,name_en,name_ar])=>({slug,name_en,name_ar}));
  window.SEED_CONFIGS=[
    {tier:'ENTRY',name:'Starter Pixel',use_case:'1080p esports and school',price:485000,components:{CPU:'Ryzen 5 5600',GPU:'Radeon RX 6600 8GB',RAM:'16GB DDR4',Storage:'1TB NVMe',PSU:'650W 80+ Bronze',Case:'Airflow Mini Tower',Cooling:'Tower air cooler'},options:{RAM:[{label:'32GB DDR4',price:28000}],Storage:[{label:'2TB NVMe',price:42000}],GPU:[{label:'RTX 4060 8GB',price:125000}]}},
    {tier:'MID',name:'Neon Runner',use_case:'1440p gaming and streaming',price:920000,components:{CPU:'Ryzen 5 7600',GPU:'RTX 4060 Ti 8GB',RAM:'32GB DDR5',Storage:'1TB NVMe Gen4',PSU:'750W Gold',Case:'Mesh ATX Tower',Cooling:'240mm liquid cooler'},options:{RAM:[{label:'64GB DDR5',price:52000}],Storage:[{label:'2TB NVMe',price:58000}],GPU:[{label:'RTX 4070 Super',price:245000}]}},
    {tier:'HIGH',name:'Arcade Elite',use_case:'High refresh 1440p / entry 4K',price:1580000,components:{CPU:'Ryzen 7 7800X3D',GPU:'RTX 4070 Super 12GB',RAM:'32GB DDR5 6000',Storage:'2TB NVMe Gen4',PSU:'850W Gold',Case:'Panorama ATX',Cooling:'360mm liquid cooler'},options:{RAM:[{label:'64GB DDR5',price:62000}],Storage:[{label:'4TB NVMe',price:118000}],GPU:[{label:'RTX 4080 Super',price:510000}]}},
    {tier:'ULTRA',name:'Final Boss',use_case:'4K ultra and creator workloads',price:2850000,components:{CPU:'Ryzen 9 9950X',GPU:'RTX 4090 24GB',RAM:'64GB DDR5 6000',Storage:'4TB NVMe Gen5',PSU:'1200W Platinum',Case:'Full Tower Glass',Cooling:'420mm liquid cooler'},options:{RAM:[{label:'96GB DDR5',price:110000}],Storage:[{label:'8TB NVMe',price:230000}],GPU:[{label:'RTX 5090 32GB',price:880000}]}}
  ];
})();
