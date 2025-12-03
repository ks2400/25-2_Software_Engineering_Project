const checkButton = document.getElementById("check");
const $disabledButton = document.querySelectorAll(".navBuilding button");
const $floorButton = document.querySelectorAll(".navFloor button");
const rooms = document.querySelectorAll(".item");
const floorSchedule = document.getElementById("floorSchedule");
const floorTitle = document.getElementById("floorTitle");
const floorDescription = document.getElementById("floorDescription");
const week = ["mon", "tue", "wed", "thu"];
const specialArea = ["stair", "bathroom", "corridor", "rest"];
let statusHTML = "";
let currentFloor = "3";

function updateOccupiedStatus() {
    const day = document.getElementById("day").value;
    const period = document.getElementById("class").value;
    const periodNum = Number(period.replace("class", ""));
    const dayIndex = week.indexOf(day);

    rooms.forEach((room) => {
        const roomNum = room.dataset[`${currentFloor}RoomInfo`];
        // 여기에서 쓰인게 백틱 이라는 건데, 백틱의 경우는 백틱 안에 있는 모든 행동?을 다 허용해준다고 함.
        // 예를 들자면 백틱 안에서 줄 바꾸는 것이 허용 됨.

        if (!roomNum || !timeTable[currentFloor]?.[roomNum]) {
            //저기에 있는 ?.은 옵셔널 체이닝 이라는 것인데, 값이 없을 경우 오류 대신 undefined를 내보내준다고 함.
            room.classList.remove("occupied");
            return;
        }

        const isOccupied = timeTable[currentFloor][roomNum][periodNum]?.[dayIndex];

        if (isOccupied) {
            room.classList.add("occupied");
        } else {
            room.classList.remove("occupied");
        }
    });
}

checkButton.addEventListener("click", () => {
    const day = document.getElementById("day").value;
    const period = document.getElementById("class").value;
    const periodNum = Number(period.replace("class", ""));
    console.log(day, periodNum + "교시로 설정");

    floorSchedule.innerHTML = "";
    updateOccupiedStatus();
});

rooms.forEach((room) => {
    room.addEventListener("click", (event) => {
        const day = document.getElementById("day").value;
        const period = document.getElementById("class").value;
        const periodNum = Number(period.replace("class", ""));
        const dayIndex = week.indexOf(day);

        const roomNum = event.currentTarget.dataset[`${currentFloor}RoomInfo`] || event.currentTarget.dataset.roomInfo;
        // 일반 방인 경우 숫자-room-info로 data를 설정해둬서 일반 방인 경우 왼쪽, 아닌경우 오른쪽
        const type = event.currentTarget.dataset.roomInfo;
        console.log(roomNum);

        if (specialArea.includes(type) && type != "room") return;
        if (type == "room" && !roomNum) return;

        rooms.forEach(r => r.classList.remove("selected"));

        if (!roomNum) return;

        event.currentTarget.classList.add("selected");

        const hasTimeTable = timeTable[currentFloor]?.[roomNum];

        if (hasTimeTable) {
            let isClass = false;
            if (timeTable[currentFloor][roomNum][periodNum]) {
                isClass = !!timeTable[currentFloor][roomNum][periodNum][dayIndex];
            }

            if (isClass) {
                statusHTML = `<span class="ongoing"> ${roomNum}호: 수업 중입니다.</span>`;
            } else {
                statusHTML = `<span class="notClass"> ${roomNum}호: 지금은 비어 있습니다.</span>`;
            }
        } else {
            const roomName = timeTable[currentFloor]?.[roomNum] || "정보 없음";
            statusHTML = `<span class="notClass"> ${roomNum}호 ${roomName}입니다.</span>`;
        }

        floorSchedule.innerHTML = `
            <div class="roomStatus">${statusHTML}</div>
        `;
    });
});

function updateRAside(floorKey) {
    const data = floorData[floorKey];
    floorTitle.innerText = floorKey.replace("F", "") + "층 정보";
    floorDescription.innerHTML = "<ul class='floorList'>" +
        data.description.map(line => `<li>${line}</li>`).join("") + "</ul>";
}

$floorButton.forEach((floor) => {
    floor.addEventListener("click", (event) => {
        $floorButton.forEach(btn => btn.classList.remove("active"));
        event.target.classList.add("active");

        const whatFloor = event.target.id;
        switch (whatFloor) {
            case "F3":
                currentFloor = "3";
                updateRAside("3F");
                break;
            case "F4":
                currentFloor = "4";
                updateRAside("4F");
                break;
            case "F5":
                currentFloor = "5";
                updateRAside("5F");
                break;
            default:
                alert("없는 층 어떻게 고르셨어요?");
                return;
        }

        document.body.classList.remove("floor3", "floor4", "floor5");
        document.body.classList.add(`floor${currentFloor}`);

        console.log(currentFloor, "층으로 변경"); // 특정 층으로 변경시 콘솔창에서 특정 층으로 변경시켰다고 로그 띄워줌
        floorSchedule.innerHTML = "";
        updateRoomLabels(currentFloor);
        updateOccupiedStatus();

        function updateRoomLabels(floor) {
            document.querySelectorAll(".item").forEach(item => {
                const hasAnyRoomSlot =
                    item.dataset["3RoomInfo"] ||
                    item.dataset["4RoomInfo"] ||
                    item.dataset["5RoomInfo"];

                if (!hasAnyRoomSlot) return;

                const key = `${floor}RoomInfo`;
                const roomNum = item.dataset[key];

                if (!roomNum) {
                    item.innerHTML = "";
                    return;
                }
                item.innerHTML = `<span class="roomLabel">${roomNum}호</span>`;
            });
        }
        document.querySelectorAll(".item").forEach(item => {
            const type = item.dataset.roomInfo;
            switch (type) {
                case "stair":
                    item.innerHTML = `<span class="roomLabel">계단</span>`;
                    break;
                case "corridor":
                    item.innerHTML = `<span class="roomLabel">복도</span>`;
                    break;
                case "bathroom":
                    item.innerHTML = `<span class="roomLabel">화장실</span>`;
                    break;
                case "rest":
                    item.innerHTML = `<span class="roomLabel">휴게실</span>`;
                    break;
                default:
            };
        });
    });
});

document.getElementById("F3").click();

//시스템상으로는 === 혹은 !== 을 쓰는게 더 안전하지만 이건 이해 못할수도 있을것 같아서 == 혹은 !=으로 통일