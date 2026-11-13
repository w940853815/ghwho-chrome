import json
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
source = json.loads((root / 'manifest.json').read_text())
allowed_roots = {'manifest.json', '_locales', 'src', 'popup', 'icons', 'LICENSE', 'README.md', 'README.en.md'}

for browser in ('chrome', 'edge', 'firefox'):
    package = root / 'dist' / f'ghwho-{browser}-{source["version"]}.zip'
    with ZipFile(package) as archive:
        assert archive.testzip() is None
        names = archive.namelist()
        assert all(Path(name).parts[0] in allowed_roots and '..' not in Path(name).parts for name in names)
        assert len(names) == len(set(names))
        manifest = json.loads(archive.read('manifest.json'))
        assert manifest['version'] == source['version']
        assert manifest['homepage_url'] == source['homepage_url']
        assert archive.read('LICENSE') == (root / 'LICENSE').read_bytes()
        for item in manifest['content_scripts']:
            for file in item['js'] + item['css']:
                assert archive.read(file) == (root / file).read_bytes()
        assert manifest['action']['default_popup'] in names
        if browser == 'firefox':
            assert manifest['browser_specific_settings']['gecko']['id'] == 'ghwho@w940853815.github.io'
        else:
            assert 'browser_specific_settings' not in manifest
            assert manifest['minimum_chrome_version'] == '109'
    print(f'PASS: {package.name}')
