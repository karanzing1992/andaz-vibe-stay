"use strict";
(function(){
  const menu=document.querySelector("[data-menu-toggle]");
  const nav=document.querySelector("[data-nav]");
  if(menu&&nav){
    menu.addEventListener("click",function(){
      const open=nav.classList.toggle("open");
      menu.setAttribute("aria-expanded",String(open));
      menu.textContent=open?"Close ✕":"Menu ☰";
    });
    nav.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click",function(){nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="Menu ☰";});
    });
  }
  function localISO(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
  const today=localISO(new Date());
  document.querySelectorAll('input[type="date"]').forEach(function(input){input.min=today;});
  const checkin=document.getElementById("checkin");
  const checkout=document.getElementById("checkout");
  if(checkin&&checkout){
    checkin.addEventListener("change",function(){
      if(!checkin.value)return;
      const day=new Date(checkin.value+"T12:00:00");
      day.setDate(day.getDate()+1);
      checkout.min=localISO(day);
      if(checkout.value&&checkout.value<checkout.min)checkout.value="";
    });
  }
  const preferred=new URLSearchParams(window.location.search).get("room");
  const roomSelect=document.getElementById("room-type");
  const roomOptions={"non-ac-dorm":"Non-AC six-bed dorm","ac-dorm":"AC six-bed dorm","two-bed":"Two-bed non-AC dorm","private-ac":"Private AC room"};
  if(roomSelect&&preferred&&Object.prototype.hasOwnProperty.call(roomOptions,preferred))roomSelect.value=roomOptions[preferred];
  const form=document.getElementById("booking-form");
  if(form){
    form.addEventListener("submit",function(event){
      event.preventDefault();
      const error=document.getElementById("form-error");
      const name=document.getElementById("guest-name").value.trim();
      const room=document.getElementById("room-type").value;
      const guests=Number(document.getElementById("guests").value);
      const ci=checkin.value,co=checkout.value;
      if(!name||!room||!ci||!co||!Number.isInteger(guests)||guests<1||guests>12){
        error.textContent="Please complete all fields and choose 1–12 guests.";return;
      }
      if(ci<today||co<=ci){
        error.textContent="Checkout must be after check-in, and dates cannot be in the past.";return;
      }
      error.textContent="";
      const msg="Hi Andaz Vibe Stay! I'd like to check availability.\nName: "+name+"\nStay: "+room+"\nGuests: "+guests+"\nCheck-in: "+ci+"\nCheck-out: "+co+"\nPlease share availability and the final price.";
      window.location.href="https://wa.me/918999541081?text="+encodeURIComponent(msg);
    });
  }
})();