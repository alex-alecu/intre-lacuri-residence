export const rooms = [
 {id:'living',name:'Living & kitchen',side:'LEFT',area:26.38,x:0,z:4.70,w:6.45,d:5.20,measurement:'6.45 × 5.20 m, less recesses',primary:true,detail:'Gather & cook',description:'A soft corner sofa, oak dining table, and warm kitchen.',visit:[5.65,6.7]},
 {id:'master',name:'Master bedroom',side:'RIGHT',area:13.95,x:10.33,z:0,w:3.87,d:3.60,measurement:'3.87 × 3.60 m',primary:true,detail:'Rest & recharge',description:'A linen bed, full-height storage, and soft reading light.',visit:[11.1,2.6]},
 {id:'daughter',name:'Daughter’s room',side:'LEFT',area:12,x:4,z:0,w:4,d:3,measurement:'4.00 × 3.00 m*',primary:true,detail:'Play & dream',description:'A low bed, a reading corner, and space to play.',visit:[5.1,2.4]},
 {id:'guest',name:'Guest room & office',side:'LEFT',area:13.74,x:0,z:1,w:3.87,d:3.57,measurement:'3.87 × 3.57 m',primary:true,detail:'Stay & work',description:'A guest bed and a quiet desk beside the window.',visit:[1.2,3.8]},
 {id:'lounge',name:'Family lounge & office',side:'RIGHT',area:26.61,x:8.25,z:3.73,w:5.95,d:4.28,measurement:'5.95 × 4.28 m + entry recess',primary:true,detail:'Read & work',description:'A second desk by the window and a relaxed family lounge.',visit:[9.15,6.7]},
 {id:'bath',name:'Bathrooms & utility',side:'BOTH',area:12.67,x:6.2,z:3.13,w:1.8,d:2.45,measurement:'1.80 × 2.45 / 1.95 × 2.37 m',primary:true,detail:'Three wet rooms',description:'Warm stone, oak vanities, and a separate utility room.',visit:[6.85,4.4]},
 {id:'bath-right',name:'Right bathroom',side:'RIGHT',area:4.63,x:8.25,z:0,w:1.95,d:2.37,measurement:'1.95 × 2.37 m',primary:false,detail:'',description:'',visit:[9.35,1.35]},
 {id:'utility',name:'Utility & WC',side:'LEFT',area:3.63,x:2.68,z:8.25,w:2.2,d:1.65,measurement:'2.20 × 1.65 m',primary:false,detail:'',description:'',visit:[4.4,8.8]},
 {id:'hall-left',name:'Left entry',side:'LEFT',area:2.57,x:5.01,z:8.14,w:1.44,d:1.76,measurement:'1.45 m clear width',primary:false,detail:'',description:'',visit:[5.65,9.1]},
 {id:'hall-right',name:'Right entry',side:'RIGHT',area:4.72,x:6.70,z:5.83,w:1.3,d:4.07,measurement:'1.30 × 4.07 m',primary:false,detail:'',description:'',visit:[7.35,9.1]},
 {id:'connection',name:'Internal hall connection',side:'BOTH',area:.3,x:6.45,z:8.35,w:.25,d:1.2,measurement:'1.20 × 2.15 m opening',primary:false,detail:'Proposed opening',description:'A clear passage between the two original entry halls.',visit:[5.65,8.95]},
];
export const shell=[[-.4,.6],[3.6,.6],[3.6,-.4],[14.6,-.4],[14.6,8.26],[8.25,8.26],[8.25,10.3],[-.4,10.3]];
export const balconies=[{name:'West balcony',area:11.57,points:[[-1.7,-.7],[3.6,-.7],[3.6,.6],[-.4,.6],[-.4,4.2],[-1.7,4.2]]},{name:'East balcony',area:11.05,points:[[11.5,-1.7],[15.9,-1.7],[15.9,3.7],[14.6,3.7],[14.6,-.4],[11.5,-.4]]}];
