const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const getLocalDate = () => {
    const now = new Date();
    return formatDate(now);
};

const addDays = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return formatDate(date);
};

module.exports = {
    formatDate,
    getLocalDate,
    addDays
}; 