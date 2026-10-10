document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('form').forEach(form=>form.noValidate=true);M.AutoInit();M.updateTextFields();const menu=document.querySelector('#document-menu');document.querySelector('.mobile-menu')?.addEventListener('click',()=>menu.classList.toggle('show'));menu?.querySelector('.logo-container').addEventListener('click',()=>menu.classList.remove('show'));});
document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
  dropdowns.forEach(dropdown => {
    dropdown.querySelector('summary').addEventListener('click', () => {
      dropdowns.forEach(other => { if (other !== dropdown) other.open = false; });
    });
    dropdown.addEventListener('click', event => {
      if (event.target.closest('a')) dropdown.open = false;
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-dropdown')) dropdowns.forEach(dropdown => dropdown.open = false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const opened = dropdowns.find(dropdown => dropdown.open);
      if (opened) { opened.open = false; opened.querySelector('summary').focus(); }
    }
  });
});
