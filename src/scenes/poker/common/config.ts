const phaserCoonfigWidth: number = window.innerWidth;
const phaserConfigHeight: number = window.innerHeight;

const divisionRows: number = 12;

const config = {
    phaserConfig: {
        width: phaserCoonfigWidth,
        height: phaserConfigHeight,
    },
    container: {
        house: {
            /* 
            高さ3/12,
            x,yは0,
            */
            x: 0,
            y: 0,
            width: phaserCoonfigWidth,
            height: (phaserConfigHeight / divisionRows) * 3,
        },
        community: {
            /*
            高さ4/12
            xは0
            yは3/12
            */
            x: 0,
            y: (phaserConfigHeight / divisionRows) * 3,
            width: phaserCoonfigWidth,
            height: (phaserConfigHeight / divisionRows) * 4,
        },
        player: {
            /*
            高さ3/12
            xは0
            yは7/12
            */
            x: 0,
            y: (phaserConfigHeight / divisionRows) * 7,
            width: phaserCoonfigWidth,
            height: (phaserConfigHeight / 12) * 3,
        },
        action: {
            /*
            高さ2/12
            xは0
            yは10/12
            */
            x: 0,
            y: (phaserConfigHeight / divisionRows) * 10,
            width: phaserCoonfigWidth,
            height: (phaserConfigHeight / divisionRows) * 2,
        },
    },
    card: {
        scaleX: 0.13,
        scaleY: 0.13,
        backScaleX: 0.65,
        backScaleY: 0.65,
        communitySpace: 50,
        playerSpace: 120,
    },
    text: {
        fontSize: {
            amount: 20,
            playerName: 20,
            playerAction: 20,
            turn: 20,
            round: 20,
            pot: 20,
            ante: 20,
            chooseAction: 23,
            handRank: 25,
            playerDealer: 20,
            modal: 50,
        },
    },
    animation: {
        dealCard: {
            startX: window.innerWidth - 100,
            startY: -window.innerHeight,
        }
    }


};

export default config;