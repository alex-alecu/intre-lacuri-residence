export const rooms = [
 {id:'living',name:'Living',side:'ARIPA DE VEST',area:26.38,x:0,z:4.70,w:6.45,d:5.20,measurement:'6.45 × 5.20 m, less recesses',primary:true,detail:'Relaxare și confort',description:'Canapea verde-salvie, două fotolii crem și măsuță ovală. Televizor pe peretele opus și canapea la capătul peretelui din spate.',visit:[5.65,6.7]},
 {id:'master',name:'Dormitor matrimonial',side:'ARIPA DE EST',area:13.95,x:10.325,z:0,w:3.875,d:3.60,measurement:'3.875 × 3.60 m',primary:true,detail:'Odihnă și liniște',description:'Pat tapițat, dulapuri înalte și lumină caldă pentru lectură.',visit:[11.3,2.8]},
 {id:'daughter',name:'Camera fetiței',side:'ARIPA DE VEST',area:12,x:4,z:0,w:4,d:3,measurement:'4.00 × 3.00 m*',primary:true,detail:'Joacă și povești',description:'Pat-căsuță din lemn, nori luminoși, cort de lectură și depozitare joasă pentru jucării.',visit:[5.90,2.35]},
 {id:'guest',name:'Oaspeți și birou',side:'ARIPA DE VEST',area:13.74,x:0,z:1,w:3.875,d:3.575,measurement:'3.875 × 3.575 m',primary:true,detail:'Ospitalitate și lucru',description:'Pat confortabil, birou lângă fereastră și acces direct din hol.',visit:[3.40,3.70]},
 {id:'kitchen',name:'Bucătărie și masă',side:'ARIPA DE EST',area:26.61,x:8.25,z:3.725,w:5.95,d:4.275,measurement:'5.95 × 4.275 m + entry recess',primary:true,detail:'Gătit și mese împreună',description:'Masă din lemn pentru șase persoane, colțar generos și măsuță de cafea.',visit:[9.65,4.95]},
 {id:'bath',name:'Băi și spălătorie',side:'SPAȚIU COMUN',area:4.41,x:6.2,z:3.125,w:1.8,d:2.45,measurement:'1.80 × 2.45 / 1.95 × 2.375 m',primary:true,detail:'Piatră și lemn natural',description:'Căzi, vase WC suspendate și lavoare cu depozitare integrată.',visit:[6.85,4.4]},
 {id:'bath-right',name:'Baia de est',side:'ARIPA DE EST',area:4.63,x:8.25,z:0,w:1.95,d:2.375,measurement:'1.95 × 2.375 m',primary:false,detail:'',description:'',visit:[9.35,1.35]},
 {id:'utility',name:'Spălătorie și WC',side:'ARIPA DE VEST',area:3.63,x:2.675,z:8.25,w:2.2,d:1.65,measurement:'2.20 × 1.65 m',primary:false,detail:'',description:'',visit:[3.8,8.65]},
 {id:'hall-left',name:'Holul de vest',side:'ARIPA DE VEST',area:2.57,x:5,z:8.125,w:1.45,d:1.775,measurement:'1.45 m clear width',primary:false,detail:'',description:'',visit:[5.65,9.1]},
 {id:'hall-right',name:'Holul de est',side:'ARIPA DE EST',area:4.72,x:6.70,z:5.825,w:1.3,d:4.075,measurement:'1.30 × 4.075 m',primary:false,detail:'Haine și încălțăminte',description:'Dulap pentru paltoane și jachete, cu uși glisante și sertare pentru încălțăminte.',visit:[7.35,9.1]},
 {id:'hall-west-north',name:'Holul camerelor de vest',side:'ARIPA DE VEST',area:3.01,x:4,z:3.125,w:2.075,d:1.575,measurement:'Open hall; area from source label',primary:false,detail:'',description:'',visit:[5.3,4.3]},
 {id:'hall-east-north',name:'Holul camerelor de est',side:'ARIPA DE EST',area:2.15,x:8.25,z:2.5,w:1.95,d:1.225,measurement:'Open hall; area from source label',primary:false,detail:'Dressing',description:'Dulap cu uși glisante, lângă baie și dormitor.',visit:[9.5,3.2]},
 {id:'connection',name:'Pasajul interior',side:'SPAȚIU COMUN',area:.3,x:6.45,z:8.35,w:.25,d:1.2,measurement:'1.20 × 2.15 m opening',primary:false,detail:'Legătura dintre apartamente',description:'Trecere liberă între cele două holuri de intrare.',visit:[5.65,8.95]},
];
export const shell=[[-.4,.6],[3.6,.6],[3.6,-.4],[14.6,-.4],[14.6,8.475],[13.95,8.475],[13.95,8.25],[8.25,8.25],[8.25,10.15],[3.95,10.15],[3.95,10.3],[-.4,10.3]];
// Navigation zones follow wall faces. Source area labels use different boundaries.
export const roomFootprints:Record<string,number[][]>={
 living:[[0,4.7],[6.075,4.7],[6.075,5.7],[6.45,5.7],[6.45,8.125],[2.55,8.125],[2.55,9.63],[2.28,9.63],[2.28,9.9],[0,9.9],[0,8],[.25,8],[.25,7.5],[0,7.5]],
 guest:[[.25,1],[3.875,1],[3.875,4.575],[0,4.575],[0,1.45],[.25,1.45]],
 kitchen:[[8.25,3.725],[10.33,3.725],[10.33,3.995],[10.67,3.995],[10.67,3.725],[14.2,3.725],[14.2,7.775],[13.95,7.775],[13.95,8],[8.25,8],[8.25,7.75],[8,7.75],[8,5.825],[8.25,5.825]],
 bath:[[6.2,3.125],[7.73,3.125],[7.73,3.695],[8,3.695],[8,5.575],[6.2,5.575]],
 'bath-right':[[8.52,0],[10.2,0],[10.2,2.375],[8.25,2.375],[8.25,.75],[8.52,.75]],
 utility:[[2.675,8.25],[4.875,8.25],[4.875,9.63],[4.305,9.63],[4.305,9.9],[2.675,9.9]],
 'hall-east-north':[[8.25,2.5],[10.2,2.5],[10.2,3.725],[8.8,3.725],[8.8,3.6],[8.25,3.6]],
};
export const balconies=[{name:'Balconul de vest',area:11.57,points:[[-1.7,-.7],[3.6,-.7],[3.6,.6],[-.4,.6],[-.4,4.2],[-1.7,4.2]]},{name:'Balconul de est',area:11.05,points:[[11.5,-1.7],[15.9,-1.7],[15.9,3.7],[14.6,3.7],[14.6,-.4],[11.5,-.4]]}];
