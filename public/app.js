const toCurrency = price => {
  return new Intl.NumberFormat('en', {
    currency: 'usd',
    style: 'currency',
  }).format(price);
};

const toDate = date => {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
};

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent);
});

document.querySelectorAll('.date').forEach(node => {
  node.innerHTML = `<strong>Date:</strong> ${toDate(node.textContent)}`;
});

const $cart = document.querySelector('#card');
if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const { id } = event.target.dataset;
      const token = event.target.dataset.csrf;
      fetch(`card/remove/${id}`, {
        method: 'delete',
        headers: {
          'X-CSRF-TOKEN': token,
        },
      }).then(resp => resp.json())
        .then(cart => {
          if (cart.courses.length) {
            const html = cart.courses.map(c => {
              return `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.count}</td>
                  <td>
                    <button class="btn btn-small js-remove" data-id="${c.id}" data-csrf="${token}">Remove</button>
                  </td>
                </tr>
              `;
            }).join('');
            $cart.querySelector('tbody').innerHTML = html;
            $cart.querySelector('.price').textContent = toCurrency(cart.price);
          } else {
            $cart.innerHTML = '<h5>Cart is empty</h5>';
          }
        })
        .catch(err => console.log(err));
    }
  });
}

M.Tabs.init(document.querySelectorAll('.tabs'));
