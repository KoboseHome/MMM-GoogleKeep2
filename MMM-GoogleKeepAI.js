Module.register("MMM-GoogleKeepAI", {
    defaults: {
        listID: "",
        maxResults: 10,
        dateFormat: "MMM Do",
        updateInterval: 10000,
        animationSpeed: 2000,
        tableClass: "small",
    },

    getScripts: function () {
        return ["moment.js"];
    },

    getStyles: function () {
        return ["MMM-GoogleKeepAI.css"];
    },

    start: function () {
        this.keepData = [];
        this.sendSocketNotification("START_FETCHING", this.config);
        setInterval(() => {
            this.sendSocketNotification("START_FETCHING", this.config);
        }, this.config.updateInterval);
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = this.config.tableClass;

        if (this.keepData.length === 0) {
            wrapper.innerHTML = "Loading...";
            return wrapper;
        }

        var table = document.createElement("table");
        this.keepData.forEach(item => {
            var row = document.createElement("tr");
            var cell = document.createElement("td");
            cell.innerHTML = item.title;
            row.appendChild(cell);
            table.appendChild(row);
        });

        wrapper.appendChild(table);
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "KEEP_DATA") {
            this.keepData = payload;
            this.updateDom(this.config.animationSpeed);
        }
    }
});
