export const getDateFormat = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const day = ('0' + now.getDate()).slice(-2);
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const seconds = ('0' + now.getSeconds()).slice(-2);

  return `${year}${month}${day} ${hours}${minutes}${seconds}`;
};

export const formatPhoneNumber = (phoneNumber: string) => {
  // Remove any non-digit characters (like hyphens)
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Format the number to '010.1234.1234'
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1.$2.$3');
};
