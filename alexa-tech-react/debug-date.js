const dateString = '2024-01-15T10:30:00.000Z';
const date = new Date(dateString);
console.log('Original:', dateString);
console.log('Date object:', date);
console.log('UTC Date:', date.toISOString());
console.log('Local Date:', date.toString());

const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear();
const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');

const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
console.log('Formatted:', formatted);
console.log('Expected: 15/01/2024 10:30');