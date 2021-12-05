class Utils {
    static msToTime(ms) {
        let fullFill = (a, limit) => ("0".repeat(69) + a.toString()).slice(limit ? -limit : -2);

        let daet = new Date(ms);
        
        let day = fullFill(daet.getDate());
        let month = fullFill(daet.getMonth());
        let year = fullFill(daet.getFullYear(), 4);
        
        let hours = fullFill(daet.getHours());
        let mins = fullFill(daet.getMinutes());
        let secs = fullFill(daet.getSeconds());
        
        return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
    }
}

module.exports = Utils;