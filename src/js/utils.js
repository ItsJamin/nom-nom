
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function activateAmountEditing(amountInput) {
    amountInput.addEventListener("click", () => {
      amountInput.removeAttribute("readonly");
      amountInput.focus();
    });
  
    amountInput.addEventListener("blur", () => {
      amountInput.setAttribute("readonly", true);
    });
  }