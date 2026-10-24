import { choose, encode, warnings } from '/assets/codec.mjs?v=2';

const checks = [...document.querySelectorAll('input[name="explore-category"]')];
const $ = selector => document.querySelector(selector);

function update() {
  const ids = checks.filter(check => check.checked).map(check => Number(check.value));
  const count = ids.length;
  let offset = 0n;
  for (let size = 0; size < count; size++) offset += choose(99, size);
  const combination = ids.reduce((rank, id, index) => rank + choose(id - 1, index + 1), 0n);
  const rank = offset + combination;
  const code = encode(ids).slice(1);
  const issues = warnings(ids);
  const shareable = count > 0 && issues.length === 0;
  $('#explore-ids').textContent = ids.length ? ids.join(', ') : '∅';
  $('#explore-count').textContent = String(count);
  $('#explore-offset').textContent = offset.toString();
  $('#explore-colex').textContent = combination.toString();
  $('#explore-rank').textContent = rank.toString();
  $('#explore-payload').textContent = code;
  $('#explore-code').textContent = code;
  $('#explore-summary').textContent = count ? `${count} ${count === 1 ? 'statement' : 'statements'} selected.` : 'No declarations selected.';
  const selected = $('#explore-selected');
  selected.replaceChildren();
  for (const check of checks.filter(check => check.checked)) {
    const item = document.createElement('li');
    item.textContent = `${check.value} · ${check.closest('label').querySelector('strong').textContent}`;
    selected.append(item);
  }
  $('#explore-warning').hidden = issues.length === 0;
  $('#explore-warning').textContent = issues.join(' ');
  $('#explore-empty').hidden = count !== 0;
  const open = $('#explore-open');
  if (shareable) {
    open.href = `/1/${code}`;
    open.removeAttribute('aria-disabled');
  } else {
    open.removeAttribute('href');
    open.setAttribute('aria-disabled', 'true');
  }
  $('#explore-copy').disabled = !shareable;
}

checks.forEach(check => check.addEventListener('change', update));
document.querySelectorAll('[data-explore-preset]').forEach(button => button.addEventListener('click', () => {
  const ids = button.dataset.explorePreset.split(',').filter(Boolean).map(Number);
  checks.forEach(check => { check.checked = ids.includes(Number(check.value)); });
  update();
}));
$('#explore-copy').addEventListener('click', async () => {
  const link = `https://aiused.org/1/${$('#explore-code').textContent}`;
  try {
    await navigator.clipboard.writeText(link);
    $('#toast').textContent = 'Link copied.';
  } catch {
    $('#toast').textContent = 'Copy the link shown above.';
  }
});
update();
