 window.addEventListener('scroll', function() {
          const navbar = document.querySelector('.nav-style');
          if (window.scrollY > 10) {
            navbar.classList.add('navbar-blur');
          } else {
            navbar.classList.remove('navbar-blur');
          }
        });

function toggleMenu(){
            document.getElementById('navigation').classList.toggle('active');
        }