const NodeHelper = require("node_helper");
const { google } = require("googleapis");
const authenticate = require("./authenticate");

module.exports = NodeHelper.create({
    start: function () {
        this.auth = null;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "START_FETCHING") {
            this.config = payload;
            this.fetchGoogleKeepData();
        }
    },

    fetchGoogleKeepData: function () {
        authenticate().then(auth => {
            this.auth = auth;
            const keep = google.keep({ version: "v1", auth });
            keep.notes.list({
                pageSize: this.config.maxResults
            }).then(response => {
                this.sendSocketNotification("KEEP_DATA", response.data.notes);
            }).catch(error => {
                console.error("Error fetching Google Keep data:", error);
            });
        });
    }
});
