document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        button.style.backgroundColor = '#ddd';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 100);
    });
});

document.querySelectorAll('#playlist li, #search_list li').forEach(item => {
    item.addEventListener('click', () => {
        item.style.backgroundColor = '#ddd';
        setTimeout(() => {
            item.style.backgroundColor = '';
        }, 100);
    });
});

document.querySelector('#loop_button').addEventListener('click', function() {
    this.classList.add('enabled');
    document.querySelector('#shuffle_button').classList.remove('enabled');
    document.querySelector('#sequential_button').classList.remove('enabled');
});

document.querySelector('#shuffle_button').addEventListener('click', function() {
    this.classList.add('enabled');
    document.querySelector('#loop_button').classList.remove('enabled');
    document.querySelector('#sequential_button').classList.remove('enabled');
});

document.querySelector('#sequential_button').addEventListener('click', function() {
    this.classList.add('enabled');
    document.querySelector('#loop_button').classList.remove('enabled');
    document.querySelector('#shuffle_button').classList.remove('enabled');
});