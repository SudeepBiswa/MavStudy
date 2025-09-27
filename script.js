document.addEventListener("DOMContentLoaded", () => {
    const ageInput = document.getElementById("ageInput");
    if (!ageInput) return;

    ageInput.addEventListener("change", () => {
        const value = Number(ageInput.value);
        if(!Number.isFinite(value) || value < 18 || value > 99){
            ageInput.value = "";
        }
    });
});

function changeRoomsViewerMenu(option, event){
    const menuItems = document.querySelectorAll('.roomsViewerMenu h1');
    menuItems.forEach(item => {
        item.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
}