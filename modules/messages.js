const moment = require("moment");

function wrapMessageWithMetadata(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = wrapMessageWithMetadata;
