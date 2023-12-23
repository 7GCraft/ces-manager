module.exports = class ExecuteResult {
  /**
   * Constructor for execute result object
   * @param {Boolean} status True if successful, false otherwise
   * @param {String} message Message after executing a process
   * @param {*} returnObj Any data to return
   */
  constructor(status, message, returnObj) {
    this.status = status;
    this.message = message;
    this.returnObj = returnObj;
  }
};
