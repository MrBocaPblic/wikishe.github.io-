document.addEventListener('DOMContentLoaded', async () => {
    const $ = (selector) => document.querySelector(selector);
    const container = $('#GloboGiratorio');
    const peopleButtons = $('#botoes-mulheres');
    const status = $('#estado-carregamento');
    const image = $('#imagem-mulher');
    const fallback = $('#retrato-fallback');
    let women = [];
    let selectedIndex = 0;
    let marker;
    let earth;
    let targetOrientation;

    function makeGlobe() {
        if (!container || !window.THREE) {
            $('#legenda-globo').textContent = 'Globo indisponível';
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 1.15));
        const sunlight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunlight.position.set(4, 3, 5);
        scene.add(sunlight);

        earth = new THREE.Mesh(
            new THREE.SphereGeometry(2, 64, 64),
            new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 12 })
        );
        scene.add(earth);

        new THREE.TextureLoader().load(
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg',
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                earth.material.map = texture;
                earth.material.needsUpdate = true;
            },
            undefined,
            () => { $('#legenda-globo').textContent = 'Não foi possível carregar a textura do globo'; }
        );

        marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff3d57 })
        );
        marker.visible = false;
        earth.add(marker);
        targetOrientation = new THREE.Quaternion();

        function resize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (!width || !height) return;
            renderer.setPixelRatio(window.devicePixelRatio || 1);
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        resize();
        window.addEventListener('resize', resize);
        new ResizeObserver(resize).observe(container);

        function animate() {
            requestAnimationFrame(animate);
            if (targetOrientation) earth.quaternion.slerp(targetOrientation, 0.045);
            renderer.render(scene, camera);
        }
        animate();
    }

    function getLocation(person) {
        return Object.values(person).find((value) => value && typeof value === 'object'
            && Number.isFinite(Number(value.lat)) && Number.isFinite(Number(value.lng)));
    }

    function setMarker(location) {
        if (!marker || !location) return;
        const latitude = Number(location.lat) * Math.PI / 180;
        const longitude = Number(location.lng) * Math.PI / 180;
        const radius = 2.035;
        marker.position.set(
            -radius * Math.cos(latitude) * Math.sin(longitude),
            radius * Math.sin(latitude),
            radius * Math.cos(latitude) * Math.cos(longitude)
        );
        marker.visible = true;

        // Gira o globo para deixar o ponto escolhido voltado para a câmera.
        const direcao = marker.position.clone().normalize();
        targetOrientation.setFromUnitVectors(direcao, new THREE.Vector3(0, 0, 1));
    }

    function imagePath(value) {
        if (!value) return '';
        if (/^(https?:)?\/\//i.test(value)) return value;
        const fileName = value.split(/[\\/]/).pop();
        // Aceita caminhos antigos nos JSONs e os traduz para a pasta de assets atual.
        return `../AssetMidia/Imagens das mulheres/${encodeURIComponent(fileName)}`;
    }

    function renderPerson(index) {
        if (!women.length) return;
        selectedIndex = (index + women.length) % women.length;
        const person = women[selectedIndex].data;
        const location = getLocation(person);
        const name = person.nome || 'Nome não informado';
        const city = location?.Cidade || location?.cidade || '';
        const country = location?.Pais || location?.país || location?.pais || '';
        const area = person.area || person.cargo || person.atuacao || 'Sem informação';

        $('#nome-mulher').textContent = name;
        $('#cidade-mulher').textContent = city || 'Sem informação';
        $('#pais-mulher').textContent = country || 'Sem informação';
        $('#area-mulher').textContent = area;
        $('#texto-mulher').textContent = person.texto || person.descricao || 'Ainda não há informações para esta pessoa.';
        $('#legenda-globo').textContent = [city, country].filter(Boolean).join(' · ') || 'Localização não informada';
        setMarker(location);

        const src = imagePath(person.imagem || person.image);
        image.hidden = !src;
        fallback.hidden = Boolean(src);
        image.alt = src ? `Retrato de ${name}` : '';
        image.onerror = () => {
            image.hidden = true;
            fallback.hidden = false;
            fallback.textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
        };
        if (src) image.src = src;

        peopleButtons.querySelectorAll('button').forEach((button, buttonIndex) => {
            button.setAttribute('aria-pressed', String(buttonIndex === selectedIndex));
        });
    }

    function createButtons() {
        peopleButtons.replaceChildren();
        women.forEach(({ data }, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'botao-mulher';
            const name = data.nome || `Pessoa ${index + 1}`;
            const portrait = document.createElement('span');
            portrait.className = 'botao-retrato';
            const initials = document.createElement('span');
            initials.textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
            portrait.appendChild(initials);
            const src = imagePath(data.imagem || data.image);
            if (src) {
                const thumbnail = document.createElement('img');
                thumbnail.src = src;
                thumbnail.alt = '';
                thumbnail.addEventListener('load', () => { initials.hidden = true; });
                thumbnail.addEventListener('error', () => thumbnail.remove());
                portrait.appendChild(thumbnail);
            }
            const label = document.createElement('span');
            label.className = 'botao-nome';
            label.textContent = name;
            button.append(portrait, label);
            button.setAttribute('aria-label', `Selecionar ${name}`);
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => renderPerson(index));
            peopleButtons.appendChild(button);
        });
    }

    $('#anterior').addEventListener('click', () => renderPerson(selectedIndex - 1));
    $('#proximo').addEventListener('click', () => renderPerson(selectedIndex + 1));
    makeGlobe();

    try {
        const catalogResponse = await fetch('./info_mulheres/catalogo.json');
        if (!catalogResponse.ok) throw new Error('Não foi possível abrir info_mulheres/catalogo.json');
        const filenames = await catalogResponse.json();
        const results = await Promise.all(filenames.map(async (filename) => {
            try {
                const response = await fetch(`./info_mulheres/${encodeURIComponent(filename)}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return { filename, data: await response.json() };
            } catch (error) {
                console.error(`Erro ao carregar ${filename}:`, error);
                return null;
            }
        }));

        women = results.filter((entry) => entry && entry.data && entry.data.visivel !== false);
        if (!women.length) throw new Error('Nenhum perfil visível foi encontrado nos arquivos JSON.');
        createButtons();
        renderPerson(0);
        status.textContent = `${women.length} perfis disponíveis`;
    } catch (error) {
        console.error(error);
        status.textContent = `${error.message} Abra a página por um servidor local ou hospedagem.`;
        $('#nome-mulher').textContent = 'Não foi possível carregar os perfis';
        $('#texto-mulher').textContent = 'Os arquivos JSON precisam ser servidos por HTTP para que o navegador possa carregá-los.';
    }
});
