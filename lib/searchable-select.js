/**
 * EasyMailAI - Searchable Select
 * Convierte <select> en un dropdown con busqueda
 * Uso: new SearchableSelect(selectElement)
 */

class SearchableSelect {
  constructor(selectEl) {
    this.select = selectEl;
    this.options = [];
    this.isOpen = false;
    this.selectedIndex = -1;

    this._buildUI();
    this._syncOptions();
    this._attachEvents();
  }

  _buildUI() {
    // Wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ss-wrapper';

    // Input visible
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'ss-input';
    this.input.autocomplete = 'off';

    // Flecha
    this.arrow = document.createElement('span');
    this.arrow.className = 'ss-arrow';
    this.arrow.textContent = '\u25BC';

    // Dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ss-dropdown ss-hidden';

    // Insertar en DOM
    this.select.parentNode.insertBefore(this.wrapper, this.select);
    this.wrapper.appendChild(this.input);
    this.wrapper.appendChild(this.arrow);
    this.wrapper.appendChild(this.dropdown);
    this.select.style.display = 'none';

    // Copiar ancho
    this.wrapper.style.flex = this.select.style.flex || '1';
  }

  _syncOptions() {
    this.options = Array.from(this.select.options).map(opt => ({
      value: opt.value,
      text: opt.textContent,
      el: opt
    }));

    // Mostrar valor seleccionado
    const selected = this.select.options[this.select.selectedIndex];
    if (selected) {
      this.input.value = selected.textContent;
    }
  }

  _renderDropdown(filter) {
    this.dropdown.innerHTML = '';
    const query = (filter || '').toLowerCase();

    const filtered = this.options.filter(o =>
      !query || o.text.toLowerCase().includes(query) || o.value.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ss-item ss-empty';
      empty.textContent = '—';
      this.dropdown.appendChild(empty);
      return;
    }

    filtered.forEach((opt, idx) => {
      const item = document.createElement('div');
      item.className = 'ss-item' + (opt.value === this.select.value ? ' ss-selected' : '');
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      item.dataset.index = idx;

      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._selectValue(opt.value, opt.text);
      });

      this.dropdown.appendChild(item);
    });

    this.selectedIndex = -1;
  }

  _selectValue(value, text) {
    this.select.value = value;
    this.input.value = text;
    this._close();
    // Disparar evento change en el select original
    this.select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  _open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this._renderDropdown('');
    this.dropdown.classList.remove('ss-hidden');
    this.input.select();
  }

  _close() {
    this.isOpen = false;
    this.dropdown.classList.add('ss-hidden');
    // Restaurar texto del seleccionado
    const selected = this.select.options[this.select.selectedIndex];
    if (selected) {
      this.input.value = selected.textContent;
    }
  }

  _attachEvents() {
    this.input.addEventListener('focus', () => this._open());

    this.input.addEventListener('input', () => {
      this._renderDropdown(this.input.value);
      if (!this.isOpen) this._open();
    });

    this.input.addEventListener('blur', () => {
      setTimeout(() => this._close(), 150);
    });

    this.arrow.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (this.isOpen) {
        this._close();
      } else {
        this.input.focus();
      }
    });

    // Teclado
    this.input.addEventListener('keydown', (e) => {
      const items = this.dropdown.querySelectorAll('.ss-item:not(.ss-empty)');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this._highlightItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this._highlightItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          const item = items[this.selectedIndex];
          this._selectValue(item.dataset.value, item.textContent);
        }
      } else if (e.key === 'Escape') {
        this._close();
        this.input.blur();
      }
    });
  }

  _highlightItem(items) {
    items.forEach(i => i.classList.remove('ss-highlight'));
    if (items[this.selectedIndex]) {
      items[this.selectedIndex].classList.add('ss-highlight');
      items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // Actualizar opciones (llamar despues de cambiar el <select> programaticamente)
  refresh() {
    this._syncOptions();
  }
}

/**
 * Inicializa todos los select con clase 'searchable'
 */
function initSearchableSelects() {
  document.querySelectorAll('select.searchable').forEach(sel => {
    sel._searchable = new SearchableSelect(sel);
  });
}
