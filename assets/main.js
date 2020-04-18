const input = document.getElementById("myfile"),
  myimg = document.getElementById("myimg"),
  menuBtn = document.querySelector(".nav-icon"),
  menu = document.querySelector(".navigation"),
  cropBtn = document.getElementById("cropBtn"),
  downloadBtn = document.getElementById("downloadBtn"),
  windowMargin = 5 * 16, // x rem
  closeEnough = 10,
  ctx = canvas.getContext("2d"),
  // Aspect Ratio de la imagen final (recortada) 1:1
  cropRatioX = 1,
  cropRatioY = 1;

let cropped = false,
  rect = {},
  drag = false,
  mouseX,
  mouseY,
  dragTL = (dragT = dragTR = dragR = dragBR = dragB = dragBL = dragL = false),
  anchorRect = {},
  move;

const readURL = (e) => {
  if (input.files && input.files[0]) {
    // El objeto FileReader lee el archivo en el input
    // Lo devuelve en el formato que se le pida, en este caso una URL
    const reader = new FileReader();
    reader.onload = (e) => {
      // Setea el resultado que da el objeto FileReader en el atributo src
      myimg.src = e.target.result;
      rect = {};
      // esta espera garantiza que se setee los valores actuales del img
      setTimeout(() => {
        canvas.width = myimg.width;
        canvas.height = myimg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initRect();
        draw();
      }, 100);

      cropped = false;
    };
    // Devuelve el archivo leido como una URL que se puede usar en el atributo src
    reader.readAsDataURL(input.files[0]);
    // Borra todo en el input file y en el canvas
    e.target.value = "";
  }
};

function init() {
  // Aspect Ratio de la imagen inicial 4:3
  // myimg.style.maxWidth = "480px";
  // myimg.style.maxHeight = "360px";
  myimg.setAttribute("draggable", false);
  myimg.style.maxWidth = `${window.innerWidth - windowMargin}px`;
  myimg.style.maxHeight = `${window.innerHeight - windowMargin}px`;

  canvas.width = 0;
  canvas.height = 0;
  menuBtn.addEventListener("click", toggleMenu, false);
  input.addEventListener("change", readURL, false);
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mousemove", mouseDown, false);
  window.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  cropBtn.addEventListener("click", cropImg, false);
  downloadBtn.addEventListener("click", donwloadImg, false);
}

function toggleMenu() {
  menu.classList.toggle("navigation-open");
}

function donwloadImg(e) {
  const format = document.querySelector("input:checked").value;
  const imgName = document.querySelector("#imgName").value;
  const name = imgName === "" ? "cropped-img" : imgName;

  downloadBtn.setAttribute("download", name + "." + format);
  downloadBtn.setAttribute(
    "href",
    canvas
      .toDataURL("image/" + format)
      .replace("image/" + format, "image/octet-stream")
  );
}

function initRect() {
  // set del crop rect
  if (myimg.height < myimg.width) {
    rect.w = myimg.height * (cropRatioX / cropRatioY);
    rect.h = myimg.height;
    rect.startX = (myimg.width - rect.w) / 2;
    rect.startY = 0;
  } else {
    rect.w = myimg.width;
    rect.h = myimg.width * (cropRatioY / cropRatioX);
    rect.startX = 0;
    rect.startY = (myimg.height - rect.h) / 2;
  }
}

function mouseDown(e) {
  if (!cropped) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    // mantiene (ancla) los valores anteriores del rect
    anchorRect.X = rect.startX;
    anchorRect.Y = rect.startY;
    anchorRect.w = rect.w;
    anchorRect.h = rect.h;

    // si no hay un rect todavia, comienza a dibujar uno desde Top Left
    if (rect.w === undefined) {
      rect.startX = mouseX;
      rect.startY = mouseY;
      dragTL = true;
    }

    // si hay rect, verifica cual selecciono el usuario
    // 1. top left
    else if (
      checkCloseEnough(mouseX, rect.startX) &&
      checkCloseEnough(mouseY, rect.startY)
    ) {
      if (e.type === "mousedown") {
        dragTL = true;
        canvas.style.cursor = "nw-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 2. top
    else if (
      checkCloseEnough(mouseX, rect.startX + rect.w / 2) &&
      checkCloseEnough(mouseY, rect.startY)
    ) {
      if (e.type === "mousedown") {
        dragT = true;
        canvas.style.cursor = "n-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 3. top right
    else if (
      checkCloseEnough(mouseX, rect.startX + rect.w) &&
      checkCloseEnough(mouseY, rect.startY)
    ) {
      if (e.type === "mousedown") {
        dragTR = true;
        canvas.style.cursor = "ne-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 4. right
    else if (
      checkCloseEnough(mouseX, rect.startX + rect.w) &&
      checkCloseEnough(mouseY, rect.startY + rect.h / 2)
    ) {
      if (e.type === "mousedown") {
        dragR = true;
        canvas.style.cursor = "e-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 5. bottom right
    else if (
      checkCloseEnough(mouseX, rect.startX + rect.w) &&
      checkCloseEnough(mouseY, rect.startY + rect.h)
    ) {
      if (e.type === "mousedown") {
        dragBR = true;
        canvas.style.cursor = "nw-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 6. bottom
    else if (
      checkCloseEnough(mouseX, rect.startX + rect.w / 2) &&
      checkCloseEnough(mouseY, rect.startY + rect.h)
    ) {
      if (e.type === "mousedown") {
        dragB = true;
        canvas.style.cursor = "n-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 7. bottom left
    else if (
      checkCloseEnough(mouseX, rect.startX) &&
      checkCloseEnough(mouseY, rect.startY + rect.h)
    ) {
      if (e.type === "mousedown") {
        dragBL = true;
        canvas.style.cursor = "ne-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 8. left
    else if (
      checkCloseEnough(mouseX, rect.startX) &&
      checkCloseEnough(mouseY, rect.startY + rect.h / 2)
    ) {
      if (e.type === "mousedown") {
        dragL = true;
        canvas.style.cursor = "e-resize";
      } else if (e.type === "mousemove") {
        canvas.style.cursor = "grab";
      }
    }
    // 9. none of them
    else {
      canvas.style.cursor = "default";
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  }
}

function checkCloseEnough(p1, p2) {
  return Math.abs(p1 - p2) < closeEnough;
}

function mouseUp() {
  if (!cropped) {
    dragTL = dragT = dragTR = dragR = dragBR = dragB = dragBL = dragL = false;
    canvas.style.cursor = "default";
  }
}

function mouseMove(e) {
  if (!cropped) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    // politica para que no se rompa el aspect ratio
    // const ratioAsInt = rect.w / rect.h;
    // const cropLimit = (cropRatioX / cropRatioY) * 0.1; // 10%
    // const floor = (cropRatioX / cropRatioY) - cropLimit;
    // const ceil = (cropRatioX / cropRatioY) + cropLimit;
    // px que se suman o se restan para mantener el rect dentro del limite
    const allowCrop = 0.1;

    if (dragTL) {
      // sin mantener aspect ratio
      rect.w += rect.startX - mouseX;
      rect.h += rect.startY - mouseY;
      rect.startX = mouseX;
      rect.startY = mouseY;
      // mantiene el aspect ratio
      // move = mouseX - anchorRect.X;
      // rect.startX = anchorRect.X + move;
      // rect.startY = anchorRect.Y + move;
      // rect.w = anchorRect.w - move;
      // rect.h = anchorRect.h - move;
    } else if (dragT) {
      // sin mantener aspect ratio
      move = mouseY - anchorRect.Y;
      rect.startY = anchorRect.Y + move;
      rect.h = anchorRect.h - move;
      // mantiene el aspect ratio (dentro de cierto rango)
      // if(ratioAsInt <= floor){
      //   rect.h = (rect.w / floor) - allowCrop;
      //   move = anchorRect.h - rect.h;
      //   rect.startY -= move;
      //   dragT = false;
      // }
      // else if(ratioAsInt >= ceil){
      //   rect.h = (rect.w / ceil);
      //   // move = anchorRect.h - rect.h;
      //   // rect.startY -= move;
      //   dragT = false;
      // }
      // else if(rect.h <= canvas.height) {
      //   move = mouseY - anchorRect.Y;
      //   rect.startY = anchorRect.Y + move;
      //   rect.h = anchorRect.h - move;
      // }
    } else if (dragTR) {
      // sin mantener aspect ratio
      rect.w = Math.abs(rect.startX - mouseX);
      rect.h += rect.startY - mouseY;
      rect.startY = mouseY;
      // mantiene el aspect ratio
      // rect.startY = mouseY;
      // move = mouseY - anchorRect.Y;
      // rect.h = anchorRect.h - move;
      // rect.w = anchorRect.w - move;
    } else if (dragR) {
      // sin mantener aspect ratio
      rect.w = mouseX - rect.startX;
      // mantiene el aspect ratio (dentro de cierto rango)
      // if(ratioAsInt <= floor){
      //   rect.w = floor * (rect.h + allowCrop);
      //   dragR = false;
      // }
      // else if(ratioAsInt >= ceil){
      //   rect.w = ceil * (rect.h - allowCrop);
      //   dragR = false;
      // }
      // else if(rect.w <= canvas.width) {
      //   rect.w = mouseX - rect.startX;
      // }
    } else if (dragBR) {
      // sin mantener aspect ratio
      rect.w = Math.abs(rect.startX - mouseX);
      rect.h = Math.abs(rect.startY - mouseY);
      // mantiene el aspect ratio
      // rect.w = Math.abs(rect.startX - mouseX);
      // move = anchorRect.w - rect.w;
      // rect.h = anchorRect.h - move;
      // rect.w = anchorRect.w - move;
    } else if (dragB) {
      // sin mantener aspect ratio
      rect.h = mouseY - rect.startY;
      // mantiene el aspect ratio (dentro de cierto rango)
      // if(ratioAsInt <= floor){
      //   rect.h = (rect.w / floor) - allowCrop;
      //   dragB = false;
      // }
      // else if(ratioAsInt >= ceil){
      //   rect.h = (rect.w / ceil) + allowCrop;
      //   dragB = false;
      // }
      // else if(rect.h <= canvas.height) {
      //   rect.h = mouseY - rect.startY;
      // }
    } else if (dragBL) {
      // sin mantener aspect ratio
      rect.w += rect.startX - mouseX;
      rect.h = Math.abs(rect.startY - mouseY);
      rect.startX = mouseX;
      // mantiene el aspect ratio
      // rect.startX = mouseX;
      // move = mouseX - anchorRect.X;
      // rect.h = anchorRect.h - move;
      // rect.w = anchorRect.w - move;
    } else if (dragL) {
      move = mouseX - anchorRect.X;
      rect.startX = anchorRect.X + move;
      rect.w = anchorRect.w - move;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
  }
}

function draw() {
  // Grid Rect
  ctx.strokeStyle = "#00000020";
  ctx.moveTo(rect.startX + rect.w * (1 / 4), rect.startY);
  ctx.lineTo(rect.startX + rect.w * (1 / 4), rect.startY + rect.h);
  ctx.moveTo(rect.startX + rect.w * (2 / 4), rect.startY);
  ctx.lineTo(rect.startX + rect.w * (2 / 4), rect.startY + rect.h);
  ctx.moveTo(rect.startX + rect.w * (3 / 4), rect.startY);
  ctx.lineTo(rect.startX + rect.w * (3 / 4), rect.startY + rect.h);
  ctx.moveTo(rect.startX, rect.startY + rect.h * (1 / 4));
  ctx.lineTo(rect.startX + rect.w, rect.startY + rect.h * (1 / 4));
  ctx.moveTo(rect.startX, rect.startY + rect.h * (2 / 4));
  ctx.lineTo(rect.startX + rect.w, rect.startY + rect.h * (2 / 4));
  ctx.moveTo(rect.startX, rect.startY + rect.h * (3 / 4));
  ctx.lineTo(rect.startX + rect.w, rect.startY + rect.h * (3 / 4));
  ctx.stroke();

  // outer fill
  ctx.fillStyle = "#00000060";
  ctx.beginPath();
  // inner rect
  ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
  // outer rect
  // el 3er valor se pone negativo porque el efecto requiere uno rect dibujado clockwise y el otro counter-clockwise
  ctx.rect(canvas.width, 0, canvas.width * -1, canvas.height);
  ctx.fill();

  // Crop Rect
  ctx.strokeStyle = "#ffffff80";
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
  ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);

  // Resize points
  ctx.beginPath();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#00000080";
  ctx.lineWidth = 3;
  const halfPoint = closeEnough / 2;
  // TL point
  ctx.arc(
    rect.startX + halfPoint,
    rect.startY + halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // T point
  ctx.moveTo(
    rect.startX + rect.w / 2 + closeEnough / 1.5,
    rect.startY + halfPoint
  );
  ctx.arc(
    rect.startX + rect.w / 2,
    rect.startY + halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // TR point
  ctx.moveTo(rect.startX + rect.w - halfPoint, rect.startY + halfPoint);
  ctx.arc(
    rect.startX + rect.w - halfPoint,
    rect.startY + halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // R point
  ctx.moveTo(rect.startX + rect.w - halfPoint, rect.startY + rect.h / 2);
  ctx.arc(
    rect.startX + rect.w - halfPoint,
    rect.startY + rect.h / 2,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // BR point
  ctx.moveTo(
    rect.startX + rect.w - halfPoint,
    rect.startY + rect.h - halfPoint
  );
  ctx.arc(
    rect.startX + rect.w - halfPoint,
    rect.startY + rect.h - halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // B point
  ctx.moveTo(rect.startX + rect.w / 2, rect.startY + rect.h - halfPoint);
  ctx.arc(
    rect.startX + rect.w / 2,
    rect.startY + rect.h - halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // BL point
  ctx.moveTo(rect.startX + halfPoint, rect.startY + rect.h - halfPoint);
  ctx.arc(
    rect.startX + halfPoint,
    rect.startY + rect.h - halfPoint,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  // L point
  ctx.moveTo(rect.startX + halfPoint, rect.startY + rect.h / 2);
  ctx.arc(
    rect.startX + halfPoint,
    rect.startY + rect.h / 2,
    closeEnough / 1.5,
    0,
    2 * Math.PI
  );
  ctx.stroke();
  ctx.fill();
}

function cropImg() {
  if (!cropped) {
    let sourceX = (rect.startX / canvas.width) * myimg.naturalWidth;
    let sourceY = (rect.startY / canvas.height) * myimg.naturalHeight;
    let sourceWidth = (rect.w / canvas.width) * myimg.naturalWidth;
    let sourceHeight = (rect.h / canvas.height) * myimg.naturalHeight;
    // que el tamaño de la seccion recortada se traslade tal cual al destino
    let destWidth = rect.w;
    let destHeight = rect.h;
    // igualar el tamaño del canvas a estos dos valores para evitar que se deforme
    canvas.width = destWidth;
    canvas.height = destHeight;
    // destX y destY igual a 0 para que no quede espacio vacio en la imagen recortada
    let destX = 0;
    let destY = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      myimg,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      destWidth,
      destHeight
    );

    myimg.src = "";
    cropped = true;
  }
}

init();
