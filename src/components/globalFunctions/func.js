export const formatNum = (num) => {
  const formattedNumber = num.toFixed(2)

  if (formattedNumber > 10000) {
    // Разделяем целую и дробную части
    const parts = formattedNumber.split('.')

    // Форматируем целую часть, добавляя пробелы
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    // Объединяем целую и дробную части обратно
    return parts.join('.')
  }
  return formattedNumber
}
