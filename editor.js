// Editing remains on the device; assistant source documents are never changed.
function editDay(){
 const d=DAYS[day];
 main.innerHTML=`<div class="dayhead"><h2>編輯 ${esc(d[0])} 行程</h2><button class="btn" data-day-cancel>取消</button></div><p class="muted">依活動順序排列；時間也可填「上午」。修改只存在這個裝置，不會改動助理的表單或班機票券。</p><form id="dayform"><section class="panel"><label class="field" for="daytitle">這天的主題</label><input id="daytitle" maxlength="200" required value="${esc(d[2])}"><label class="field" for="dayzone">當地時區說明</label><input id="dayzone" maxlength="100" value="${esc(trip.timezones[day])}"></section><div id="eventrows">${d[3].map(eventRow).join('')}</div><button type="button" class="btn" data-event-add>新增活動</button><div class="actions editor-save"><button class="btn primary" type="submit">儲存行程</button><button class="btn" type="button" data-day-cancel>取消修改</button></div></form>`;
}
function eventRow(e){return `<fieldset class="panel event-editor"><legend>活動</legend><label class="field">時間<input name="eventTime" maxlength="100" value="${esc(e[0])}" placeholder="例如：09:30／上午"></label><label class="field">活動名稱<input name="eventTitle" required maxlength="500" value="${esc(e[1])}"></label><label class="field">地點與備註<textarea name="eventDetail" maxlength="10000">${esc(e[2])}</textarea></label><div class="actions"><button type="button" class="btn" data-event-up>上移</button><button type="button" class="btn" data-event-down>下移</button><button type="button" class="btn danger" data-event-remove>移除活動</button></div></fieldset>`}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-day-edit'))editDay();
 if(b.hasAttribute('data-day-cancel')&&await appConfirm('放棄尚未儲存的行程修改？'))itinerary();
 if(b.hasAttribute('data-event-add')){const rows=document.getElementById('eventrows');if(rows.children.length>=100){toast('每天最多 100 個活動');return}rows.insertAdjacentHTML('beforeend',eventRow(['','','']));rows.lastElementChild.querySelector('input').focus();}
 const row=b.closest('.event-editor');
 if(row&&b.hasAttribute('data-event-remove')&&await appConfirm('移除這個活動？儲存行程後才會生效。'))row.remove();
 if(row&&b.hasAttribute('data-event-up')&&row.previousElementSibling)row.before(row.previousElementSibling);
 if(row&&b.hasAttribute('data-event-down')&&row.nextElementSibling)row.after(row.nextElementSibling);
});
document.addEventListener('submit',e=>{if(e.target.id!=='dayform')return;e.preventDefault();
 const events=[...e.target.querySelectorAll('.event-editor')].map(row=>['eventTime','eventTitle','eventDetail'].map(n=>row.querySelector(`[name="${n}"]`).value.trim()));
 const title=document.getElementById('daytitle').value.trim();if(!title||events.some(x=>!x[1])){toast('請填寫主題及活動名稱');return}
 try{const next=validateTrip({...trip,days:trip.days.map((d,i)=>i===day?[d[0],d[1],title,events]:d),timezones:trip.timezones.map((z,i)=>i===day?document.getElementById('dayzone').value.trim():z)});localStorage.setItem(TRIP_KEY,JSON.stringify(next));trip=next;DAYS=trip.days;itinerary();toast('行程已儲存，備份也會包含這次修改');}catch{toast('無法儲存，請先匯出備份或檢查裝置空間。編輯內容仍在畫面上。')}
});
