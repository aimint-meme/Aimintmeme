//转换代币单位
export const formatTokenCount = (count) => {
  count = parseFloat(count);
    if (!count) {
      count = 0;
    }
    if (count >= 1e9) { // B for Billion  
      return (count / 1e9).toFixed(2) + 'B';
    } else if (count >= 1e6) { // M for Million  
      return (count / 1e6).toFixed(2) + 'M';
    } else if (count >= 1e3) { // K for Thousand  
      return (count / 1e3).toFixed(2) + 'K';
    } else {
      return count.toFixed(2); // No suffix for counts less than a thousand  
    }
};
//去掉小数点后不必要的零
export const formattedNumber = (num) => {
  const stringNumber = num.toString();
  // 分割整数部分和小数部分
  const [integerPart, decimalPart] = stringNumber.split('.');
  // 如果小数部分存在，则去掉末尾的零
  let trimmedDecimalPart = decimalPart ? decimalPart.replace(/0+$/, '') : '';
  const formattedNumber = integerPart + (trimmedDecimalPart ? '.' + trimmedDecimalPart : '');
  return formattedNumber;
};