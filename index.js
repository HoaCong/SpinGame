$(document).ready(function () {
  var isRolling = false; // Trạng thái khóa
  var resultIndex = 0; // Chỉ số kết quả hiện tại

  $("#arm").click(function (e) {
    if (isRolling) return; // Nếu đang quay, không cho phép click
    isRolling = true; // Đặt trạng thái quay
    var arm = $(this).addClass("clicked");
    setTimeout(function () {
      arm.removeClass("clicked");
    }, 500);
    e.preventDefault();
    rollAll(resultIndex).finally(() => {
      isRolling = false; // Mở khóa khi hoàn thành
      resultIndex = (resultIndex + 1) % result.length; // Cập nhật chỉ số kết quả
    });
  });
});

const debugEl = document.getElementById("debug"),
  iconMap = [
    "banana",
    "seven",
    "cherry",
    "plum",
    "orange",
    "bell",
    "bar",
    "lemon",
    "melon",
  ],
  icon_width = 79,
  icon_height = 79,
  num_icons = 9,
  time_per_icon = 100,
  indexes = [0, 0, 0],
  result = [
    [0, 5, 2],
    [8, 3, 0],
    [1, 1, 7],
    [4, 2, 5],
    [6, 6, 0],
    [2, 7, 3],
    [8, 1, 1],
    [0, 4, 4],
    [5, 8, 7],
    [3, 6, 2],
  ];

const roll = (reel, offset = 0, targetIndex) => {
  return new Promise((resolve) => {
    const style = getComputedStyle(reel),
      backgroundPositionY = parseFloat(style["background-position-y"]),
      currentIndex = Math.round(
        (backgroundPositionY % (num_icons * icon_height)) / icon_height
      ),
      // Tính số vòng tối thiểu (2 vòng) và delta cần thiết
      minRounds = 2,
      minDelta = minRounds * num_icons,
      delta = ((targetIndex - currentIndex + num_icons) % num_icons) + minDelta;

    const targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
      normTargetBackgroundPositionY =
        targetBackgroundPositionY % (num_icons * icon_height);

    setTimeout(() => {
      reel.style.transition = `background-position-y ${
        (8 + 1 * delta) * time_per_icon
      }ms cubic-bezier(.41,-0.01,.63,1.09)`;
      reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
    }, offset * 150);

    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      indexes[offset] = targetIndex; // Cập nhật chỉ số chính xác cho cuộn hiện tại
      resolve();
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

function rollAll(resultIndex) {
  debugEl.textContent = "rolling...";
  const reelsList = document.querySelectorAll(".slots > .reel");
  const targetResults = result[resultIndex];

  return Promise.all(
    [...reelsList].map((reel, i) => roll(reel, i, targetResults[i]))
  ).then(() => {
    debugEl.textContent = indexes.map((i) => iconMap[i]).join(" - ");
    if (indexes[0] === indexes[1] || indexes[1] === indexes[2]) {
      const winCls = indexes[0] === indexes[2] ? "win2" : "win1";
      document.querySelector(".slots").classList.add(winCls);
      setTimeout(
        () => document.querySelector(".slots").classList.remove(winCls),
        2000
      );
    }
  });
}
