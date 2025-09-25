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