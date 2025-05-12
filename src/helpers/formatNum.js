export const formatNum = (num, fixed = true, round = 2) => {
  let formattedNumber = num < 0 ? num * -1 : num

  if (fixed) {
    formattedNumber = num.toFixed(round)
  }

  if (formattedNumber >= 10000) {
    // Разделяем целую и дробную части
    const parts = String(formattedNumber).split('.')

    // Форматируем целую часть, добавляя пробелы
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    // Объединяем целую и дробную части обратно
    return num < 0 ? '-' + parts.join('.') : parts.join('.')
  }

  return num < 0 ? formattedNumber * -1 : formattedNumber
}
