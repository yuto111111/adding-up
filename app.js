'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, 'output':{}});
const map = new Map();//Key:都道府県 Value:集計データのオブジェクト
rl.on('line',(lineString)=>{
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if(year == 2010 || year == 2015){
        let value = map.get(prefecture);
        if(!value){
            value = {
                popu10:0,
                popu15:0,
                change:null
            };
        }
        if(year == 2010){
            value.popu10 += popu;
        }
        if(year == 2015){
            value.popu15 += popu;
        }
        map.set(prefecture,value);
    }
});
rl.resume(); //rl.resume() は、一時停止（pause）状態の readline インターフェースを再開して、'line' イベントの発火を開始させるものです。
rl.on('close',()=>{ //readline インターフェースがすべての行を読み終えて閉じたときに実行される処理を登録しています。
    //popu10 が2010年の人口合計、popu15 が2015年の人口合計、change はまだ null（未計算）です。
    //次に value.change = value.popu15 / value.popu10 ですが、これは 236840 ÷ 258530 = 0.916... という計算をして、その結果を同じオブジェクトの change に書き込んでいます。
    //ポイントは、value は Map の中にあるオブジェクトへの参照だということです。value.change = ... と書くと、コピーではなく Map 内の元のオブジェクトが直接書き換わります。なので計算結果は Map の中にちゃんと反映されます：
    for(let pair of map){
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    //Map はそのままでは並べ替えができないので、まず配列に変換しています。
    //配列の sort メソッドで並べ替えます。sort は2つの要素を比較する関数を受け取ります。
    //pair1 と pair2 はそれぞれ ['都道府県名', { popu10, popu15, change }] という配列なので、pair1[1].change で変化率を取り出しています。
    //この引き算の結果で並び順が決まります：
    const rankingArray = Array.from(map).sort((pair1,pair2)=>{
        //pair2 - pair1 の順番なので降順（大きい順）になります。もし pair1 - pair2 にすれば昇順（小さい順）になります。
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map((pair)=>{
        return pair[0] + ': ' + pair[1].popus10 + ' => ' + pair[1].popu15 + ' 変化率: ' + pair[1].change;
    });
    console.log(rankingArray);
})