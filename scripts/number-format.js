(function () {
  const numberInputSelector = 'input[type="number"], input[data-number-format]';

  function parseUserNumber(value) {
    const normalized = String(value ?? '').replace(/,/g, '').trim();
    if (!normalized || normalized === '-' || normalized === '.') return NaN;
    return Number(normalized);
  }

  function formatNumberInputValue(value) {
    const raw = String(value ?? '').replace(/,/g, '');
    const sign = raw.startsWith('-') ? '-' : '';
    const unsigned = raw.replace(/^[+-]/, '');
    const hasDecimal = unsigned.includes('.');
    const parts = unsigned.split('.');
    const integerPart = (parts.shift() || '').replace(/[^0-9]/g, '');
    const decimalPart = parts.join('').replace(/[^0-9]/g, '');
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
    const groupedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (!groupedInteger && !decimalPart && !hasDecimal) return sign;
    return `${sign}${groupedInteger || '0'}${hasDecimal ? `.${decimalPart}` : ''}`;
  }

  function semanticLength(value) {
    return String(value ?? '').replace(/,/g, '').length;
  }

  function caretForSemanticLength(formattedValue, length) {
    if (length <= 0) return 0;
    let seen = 0;
    for (let index = 0; index < formattedValue.length; index += 1) {
      if (formattedValue[index] !== ',') seen += 1;
      if (seen >= length) return index + 1;
    }
    return formattedValue.length;
  }

  function formatInput(input, preserveCaret = false) {
    const previousValue = input.value;
    const start = input.selectionStart ?? previousValue.length;
    const end = input.selectionEnd ?? start;
    const formattedValue = formatNumberInputValue(previousValue);

    input.value = formattedValue;

    if (preserveCaret && document.activeElement === input && input.setSelectionRange) {
      input.setSelectionRange(
        caretForSemanticLength(formattedValue, semanticLength(previousValue.slice(0, start))),
        caretForSemanticLength(formattedValue, semanticLength(previousValue.slice(0, end)))
      );
    }
  }

  function bindNumberInput(input) {
    input.dataset.numberFormat = 'commas';
    input.type = 'text';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';

    formatInput(input);

    input.addEventListener('input', () => formatInput(input, true));
    input.addEventListener('wheel', event => event.preventDefault(), { passive: false });
  }

  window.parseUserNumber = parseUserNumber;
  window.formatNumberInputValue = formatNumberInputValue;
  window.formatNumberInputs = () => {
    document.querySelectorAll('input[data-number-format]').forEach(input => formatInput(input));
  };

  document.querySelectorAll(numberInputSelector).forEach(bindNumberInput);
})();
