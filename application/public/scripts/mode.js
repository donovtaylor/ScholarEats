function changeMode() {
    const modeSelect = document.getElementById("modeSelect");
    const modeStyleSheetLink = document.getElementById("modeStyleSheetLink");
    const currentMode = sessionStorage.getItem("mode") || "default";

    function setMode(modeName) {
      modeStyleSheetLink.setAttribute("href", `/css/${modeName}.css`);
    }

    modeSelect.addEventListener("change", () => {
      setMode(modeSelect.value);
      sessionStorage.setItem("mode", modeSelect.value);

    });

    modeSelect.value = currentMode;
    setMode(currentMode);
  }

  changeMode();