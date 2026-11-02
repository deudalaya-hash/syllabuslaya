const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
const styles = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
const progsStart = script.indexOf('function progs(){');
const progsEnd = script.indexOf('function activateProg(', progsStart);
const progs = script.slice(progsStart, progsEnd);
const coreData = script.slice(script.indexOf('var CIVIL=['), script.indexOf('var prog="civil"'));
const curriculumApi = new Function(coreData + 'return {CIVIL:CIVIL,PROGS:PROGS};')();
const storageStart = script.indexOf('var SEMESTER_STORAGE_PREFIX=');
const storageEnd = script.indexOf('function save(){', storageStart);
const storageApiSource = script.slice(storageStart, storageEnd);
function createStorageApi(storage) {
  return new Function('PROGS', 'localStorage', storageApiSource +
    'return {semesterStorageKey:semesterStorageKey,saveSemesterIndex:saveSemesterIndex,getSavedSemesterIndex:getSavedSemesterIndex};'
  )(curriculumApi.PROGS, storage);
}
const pathwaysStart = script.indexOf('// Additional learning pathways: placeholders remain clearly marked');
const pathwaysEnd = script.indexOf('var EDU_GROUPS=', pathwaysStart);
const searchStart = pathwaysEnd;
const searchEnd = script.indexOf('function renderSearchSuggestions(', searchStart);
const searchApi = new Function(
  coreData + script.slice(pathwaysStart, pathwaysEnd) + script.slice(searchStart, searchEnd) +
    'return {PROGS:PROGS,EDU_GROUPS:EDU_GROUPS,collectSearchResults:collectSearchResults};'
)();

test('homepage exposes exactly one Pre-School to PhD search field', () => {
  assert.equal((html.match(/id="q"/g) || []).length, 1);
  assert.match(html, /<form[^>]+id="search-form"[^>]+role="search"/);
  assert.match(html, /id="q"[^>]+placeholder="Search subject, programme or topic"/);
  assert.match(script, /wholeLabel\.textContent="Pre-School – PhD"/);
  assert.doesNotMatch(html, /class="search-context"/);
  assert.match(html, /<svg class="search-mark"/);
  assert.doesNotMatch(script, /wholeLabel\.textContent="Pre-School - PhD"/);
  assert.match(script, /wholeLabel\.textContent="Pre-School – PhD"/);
  assert.match(html, /id="search-results"[^>]+role="listbox"/);
  assert.match(html, /id="clear-search"/);
});

test('homepage uses the requested Chrome proxy icon as its favicon', () => {
  assert.match(html, /<link rel="icon" href="site-icon\.png\?v=2" type="image\/png">/);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'site-icon.png')));
});

test('homepage header uses the supplied logo image asset', () => {
  assert.match(html, /<img src="deudalaya-logo\.png" alt="Syllabusलय logo">/);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'deudalaya-logo.png')));
});

test('homepage search is centered and responsive', () => {
  assert.match(styles, /body\.intro-only header \.top-search\s*\{[^}]*margin:\s*0 auto/);
  assert.match(styles, /\.search-control\s*\{[^}]*border-radius:\s*999px/);
  assert.match(styles, /@media\s*\(max-width:\s*\d+px\)/);
});

test('homepage keeps syllabus panels hidden and all programme navigation collapsed by default', () => {
  assert.match(styles, /body\.intro-only #tabs,body\.intro-only #list,body\.intro-only #tot,body\.intro-only #civil-learning-dashboard\{display:none!important\}/);
  assert.match(html, /<details class="pinned-programmes" id="pinned-programmes"/);
  assert.match(script, /whole\.open=false/);
  assert.match(script, /box\.className="prog-group";box\.open=false/);
});

test('CTEVT technical education keeps each faculty inside its own closed toggle', () => {
  assert.match(script, /group\.level==="CTEVT"/);
  assert.match(script, /className="ctevt-faculty-toggle(?: education-toggle)?";sub\.open=false/);
  for (const faculty of [
    'Engineering', 'Health Sciences', 'Agriculture', 'Forestry',
    'Hospitality and Tourism', 'Management and Humanities', 'Fashion and Design',
  ]) {
    assert.ok(script.includes('label:"' + faculty + '"'), 'missing CTEVT faculty toggle: ' + faculty);
  }
  assert.match(script, /sub\.className="ctevt-faculty-toggle education-toggle"/);
  assert.match(script, /row\.className="prog-row tabs ctevt-programme-list"/);
  assert.match(script, /sub\.appendChild\(row\);box\.appendChild\(sub\)/);
  assert.match(styles, /\.ctevt-faculty-toggle>summary::after\{content:"▾"/);
  assert.match(styles, /\.ctevt-faculty-toggle\[open\]>summary::after\{content:"▴"/);
});

test('every Pre-School to PhD education category remains an expandable toggle', () => {
  assert.match(script, /EDU_GROUPS\.forEach\(function\(group\)/);
  assert.match(script, /var box=document\.createElement\("details"\);box\.className="prog-group";box\.open=false/);
  assert.match(script, /if\(groupIndex<8\)\{content\.appendChild\(box\)/);
  assert.match(script, /else\{extraContent\.appendChild\(box\)\}/);
  assert.equal(searchApi.EDU_GROUPS.length, 22);
  assert.ok(searchApi.EDU_GROUPS.some((group) => group.level === 'Pre-School'));
  assert.ok(searchApi.EDU_GROUPS.some((group) => group.level === 'PhD'));
  assert.match(script, /Additional Education & Professional Pathways/);
});

test('search suggestions use the existing pathway and syllabus data', () => {
  assert.match(script, /var EDU_GROUPS\s*=/);
  assert.match(script, /function collectSearchResults\(/);
  assert.match(script, /Object\.keys\(PROGS\)/);
  assert.match(script, /flattenTopicText\(/);
  assert.match(progs, /EDU_GROUPS\.forEach/);
});

test('empty search suggestions offer existing learning pathways and programmes', () => {
  const suggestions = searchApi.collectSearchResults('');
  assert.ok(suggestions.some((item) => item.kind === 'category' && item.label.includes('Pre-School')));
  assert.ok(suggestions.some((item) => item.kind === 'category' && item.label.includes('Entrance Exam')));
  assert.ok(suggestions.some((item) => item.kind === 'programme' && item.programKey === 'civil'));
});

test('course and nested topic searches return direct syllabus destinations', () => {
  const course = searchApi.collectSearchResults('Engineering Mathematics I')
    .find((item) => item.kind === 'syllabus' && item.subjectCode === 'EG 1103 SH');
  assert.ok(course);
  assert.equal(course.programKey, 'civil');
  assert.equal(course.semesterIndex, 0);

  const topic = searchApi.collectSearchResults('Bernoulli theorem')
    .find((item) => item.kind === 'syllabus' && item.subjectCode === 'EG 2103 CE');
  assert.ok(topic);
  assert.match(topic.topicMatch, /Bernoulli/i);
});

test('coming-soon pathways are searchable without invented syllabus results', () => {
  const results = searchApi.collectSearchResults('Diploma in Nursing');
  assert.ok(results.some((item) => item.kind === 'programme' && item.label === 'Nursing'));
  assert.equal(results.some((item) => item.kind === 'syllabus'), false);
});

test('search results navigate to categories, programmes, and syllabus subjects', () => {
  assert.match(script, /function selectSearchResult\(/);
  assert.match(script, /function openEducationGroup\(/);
  assert.match(script, /function openSyllabusResult\(/);
  assert.match(script, /result\.semesterIndex/);
});

test('search supports Enter, arrow-key suggestions, focus suggestions, and clear', () => {
  assert.match(script, /addEventListener\("submit"/);
  assert.match(script, /ArrowDown/);
  assert.match(script, /ArrowUp/);
  assert.match(script, /e\.key==="Enter"/);
  assert.match(script, /addEventListener\("focus"/);
  assert.match(script, /clear-search/);
});

test('homepage search bar shows Pre-School to PhD label without a level selector', () => {
  assert.equal((html.match(/id="education-filter"/g) || []).length, 0);
  assert.equal((html.match(/id="search-submit"/g) || []).length, 1);
  assert.match(script, /wholeLabel\.textContent="Pre-School – PhD"/);
  assert.match(html, /id="q"[^>]+placeholder="Search subject, programme or topic"/);
  assert.doesNotMatch(script, /education-filter/);
});

test('level toggle, search field, and submit action stay inside one rounded bar', () => {
  const control = html.match(/<div class="search-control">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.match(control, /id="q"/);
  assert.match(control, /id="search-submit"/);
  assert.match(styles, /\.search-category-toggle>summary/);
});

test('Browse all education categories is a closed toggle inside the search bar', () => {
  assert.match(script, /whole\.className="education-toggle search-category-toggle"/);
  assert.match(script, /control\.insertBefore\(whole,\$\("q"\)\)/);
  assert.match(script, /function openEducationGroup\(index\).*search-category-toggle/s);
  assert.match(styles, /\.search-category-toggle\[open\]>.education-toggle-content/);
  assert.match(script, /whole\.open=false/);
  assert.match(script, /wholeLabel\.textContent="Pre-School – PhD"/);
  assert.doesNotMatch(script, /wholeLabel\.textContent="Browse all education categories"/);
  assert.equal((html.match(/Pre-School – PhD/g) || []).length, 1);
});

test('Pre-School to PhD category toggle has a visible closed/open indicator', () => {
  assert.match(styles, /\.search-category-toggle>summary\{[^}]*border:1px solid var\(--line\)/);
  assert.match(styles, /\.search-category-toggle>summary::after\{content:"▾"/);
  assert.match(styles, /\.search-category-toggle\[open\]>summary::after\{content:"▴"/);
  assert.match(styles, /\.search-category-toggle>summary::before\{content:none/);
});

test('expanded category menu is anchored to the full search bar and stays within viewport width', () => {
  assert.match(styles, /\.search-control\s*\{[^}]*position:\s*relative/);
  assert.match(styles, /\.search-category-toggle\s*\{[^}]*position:\s*static/);
  assert.match(styles, /\.search-category-toggle\[open\]>.education-toggle-content\s*\{[^}]*left:\s*0;[^}]*right:\s*0;[^}]*width:\s*auto/);
  assert.doesNotMatch(styles, /\.search-category-toggle\[open\]>.education-toggle-content\s*\{[^}]*right:\s*0;[^}]*width:\s*min\(90vw,760px\)/);
});

test('manual theme choice is restored on the next visit', () => {
  assert.match(script, /localStorage\.getItem\("syllabuslaya:theme"\)/);
  assert.match(script, /localStorage\.setItem\("syllabuslaya:theme"/);
});

test('Civil Engineering exposes all six semesters and keeps the existing Semester 1 subjects', () => {
  assert.equal(curriculumApi.PROGS.civil.d.length, 6);
  assert.deepEqual(curriculumApi.PROGS.civil.d.map((semester) => semester.n), [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6',
  ]);
  assert.ok(curriculumApi.PROGS.civil.d.every((semester) => semester.s.length > 0));
  assert.deepEqual(curriculumApi.PROGS.civil.d[0].s.map((subject) => subject.slice(0, 2)), [
    ['EG 1101 SH', 'Applied Nepali'],
    ['EG 1102 SH', 'Applied English'],
    ['EG 1103 SH', 'Engineering Mathematics I'],
    ['EG 1104 SH', 'Engineering Physics I'],
    ['EG 1105 SH', 'Engineering Chemistry I'],
    ['EG 1101 AR', 'Engineering Drawing I'],
    ['EG 1101 CT', 'Computer Application'],
  ]);
  assert.match(script, /saveSemesterIndex\(prog,cur\)/);
  assert.match(script, /getSavedSemesterIndex\(p,D\.length\)/);
  assert.match(script, /b\.textContent=x\.n/);
  assert.match(script, /function tabs\(\)\{\$\("tabs"\)\.innerHTML="";var box=document\.createElement\("div"\);box\.className="semester-selector"/);
  assert.doesNotMatch(script, /box\.className="semester-selector";box\.open=/);
  assert.match(script, /b\.onclick=function\(\)\{cur=i;saveSemesterIndex\(prog,cur\);resetSearchField\(\);render\(\)\}/);
  assert.match(styles, /body\.intro-only #tabs,body\.intro-only #list,body\.intro-only #tot,body\.intro-only #civil-learning-dashboard\{display:none/);
  assert.ok(curriculumApi.PROGS.civil.d.every((semester) => semester.s.every((subject) => subject[5] && subject[5].hours)));
  assert.ok(curriculumApi.PROGS.civil.d.every((semester) => semester.s.every((subject) => {
    const assessment = subject[5].assessment;
    return assessment && Object.values(assessment).reduce((sum, value) => sum + value, 0) === subject[3];
  })));
  assert.match(script, /CTEVT Diploma in Civil Engineering · First Revision 2021/);
  assert.match(script, /Minimum 40% in theory and 50% in practical/);
  assert.match(script, /CIVIL_COMMON_SOURCE=/);
  assert.match(script, /CIVIL_SOURCE=/);
});

test('Civil Engineering syllabus expands inside the CTEVT faculty toggle', () => {
  assert.match(html, /id="programme-content-home"/);
  assert.match(script, /function createCivilProgrammeToggle\(/);
  assert.match(script, /id="inline-civil-toggle"/);
  assert.match(script, /className="inline-civil-content"/);
  assert.match(script, /function activateProg\(p\).*inline-civil-toggle/s);
  assert.match(script, /function restoreProgrammeContent\(/);
  assert.match(styles, /\.inline-civil-content\{[^}]*width:100%[^}]*min-width:0/);
  assert.match(styles, /\.inline-civil-content \.sub>details[^}]*margin-left:0/);
  assert.match(styles, /\.inline-civil-content \.row \.t\{[^}]*min-width:0/);
});

test('verified first-year codes are unique and match the CTEVT common curriculum', () => {
  const firstYear = curriculumApi.PROGS.civil.d.slice(0, 2).flatMap((semester) => semester.s);
  assert.equal(firstYear.find((subject) => subject[1] === 'Computer Application')[0], 'EG 1101 CT');
  assert.equal(firstYear.find((subject) => subject[1] === 'Applied Mechanics')[0], 'EG 1202 CE');
  assert.equal(firstYear.filter((subject) => subject[0] === 'EG 2102 CE').length, 0);
});

test('Civil subjects show expandable curriculum content and chapter progress controls without favourite clutter', () => {
  assert.match(script, /function renderCivilProgress\(/);
  assert.match(script, /function saveCivilLearning\(/);
  assert.match(script, /class="curriculum-unit"/);
  assert.match(script, /chapter-complete/);
  assert.match(script, /chapter-bookmark/);
  assert.match(script, /continue-learning/);
  assert.match(script, /var h=prog==="civil"\?/);
  assert.match(script, /class="row civil-subject-meta"/);
  assert.doesNotMatch(script, /subject-favourite|Favourite subject/);
  assert.doesNotMatch(script, /renderCourseProfile/);
});

test('Civil learning dashboard keeps progress counts without rendering progress bars', () => {
  assert.doesNotMatch(script, /<progress\s/);
  assert.doesNotMatch(styles, /\.learning-overview progress/);
  assert.match(script, /Overall programme progress · "\+overall\+"%/);
});

test('Civil units, topics, and subtopics each expose a toggled resource list', () => {
  assert.match(script, /function renderTopicResourceLinks\(/);
  assert.match(script, /renderTopicResourceLinks\(subject,child\[0\],source\)/);
  assert.match(script, /renderTopicResourceLinks\(subject,topic,source\)/);
  assert.match(script, /official curriculum PDF/i);
  assert.match(script, /youtube\.com\/results\?search_query=/);
});

test('Civil subject, topic, and resource bookmarks persist in localStorage', () => {
  assert.match(script, /bookmarkedTopics:Array\.isArray\(saved\.bookmarkedTopics\)/);
  assert.match(script, /savedResources:Array\.isArray\(saved\.savedResources\)/);
  assert.match(script, /class="topic-bookmark"/);
  assert.match(script, /class="resource-save"/);
  assert.match(script, /toggleLearningItem\("savedResources"/);
});

test('Civil subjects remain expandable without a subject bookmark button', () => {
  assert.match(script, /class="subject-open"/);
  assert.doesNotMatch(script, /subject-bookmark|Bookmark subject/);
  assert.match(script, /class="topic-bookmark"/);
  assert.match(script, /class="chapter-bookmark"/);
});

test('pinned programme access remains available in the existing site', () => {
  assert.match(html, /id="pinned-programmes"/);
  assert.match(script, /function togglePinnedProgram\(/);
  assert.match(script, /syllabuslaya:pinned-programmes:v1/);
});

test('TU Psychology and Social Work pathways are separate verified annual programmes', () => {
  assert.equal(curriculumApi.PROGS.tu_psychology.d.length, 4);
  assert.equal(curriculumApi.PROGS.tu_basw.d.length, 4);
  assert.equal(curriculumApi.PROGS.tu_ba_socialwork.d.length, 4);
  assert.match(curriculumApi.PROGS.tu_ba_socialwork.notice, /awaiting document-level verification/);
  assert.match(curriculumApi.PROGS.tu_psychology.full, /Psychology/);
  assert.match(curriculumApi.PROGS.tu_basw.full, /BASW|Social Work/);
  assert.deepEqual(curriculumApi.PROGS.tu_psychology.d.map((year) => year.n), [
    'First Year', 'Second Year', 'Third Year', 'Fourth Year',
  ]);
  assert.ok(curriculumApi.PROGS.tu_psychology.d.flatMap((year) => year.s).some((subject) => subject[0] === 'Psy 421' && subject[3] === 100));
  assert.ok(curriculumApi.PROGS.tu_basw.d.flatMap((year) => year.s).some((subject) => subject[0] === 'SW 427' && subject[3] === 100));
  assert.match(script, /annual examinations/);
  assert.match(script, /TU_PSYCHOLOGY_SOURCE/);
  assert.match(script, /TU_BASW_SOURCE/);
});

test('BA Psychology and Social Work are not presented as one verified combined curriculum', () => {
  assert.match(script, /Psychology \+ Social Work combination depends on the campus offering both/);
  assert.equal(Object.keys(curriculumApi.PROGS).some((key) => /combined/i.test(key)), false);
});

test('subject expansion, topic search routing, and completion saving remain connected', () => {
  assert.match(script, /el\.querySelector\("input"\)\.onchange=function\(e\)/);
  assert.match(script, /if\(e\.target\.checked\)done\[s\[0\]\]=1;else delete done\[s\[0\]\]/);
  assert.match(script, /save\(\);stats\(\)/);
  assert.match(script, /subject\.querySelector\("\.subject-content > details"\)/);
  assert.match(script, /subject\.querySelectorAll\("\.topics details"\)/);
});

test('selecting the already active Civil programme still opens its subject view', () => {
  assert.match(script, /button\.onclick=function\(\)\{activateProg\(programKey\)\}/);
  assert.doesNotMatch(script, /if\(programKey!==prog\)activateProg\(programKey\)/);
  assert.match(script, /if\(p==="civil"\)\$\("sub"\)\.textContent="CTEVT Nepal · Diploma in Civil Engineering · 3 years · 6 semesters · Diploma level · Engineering faculty · First Revision 2021"/);
});

test('selected semester storage is validated and isolated from completion progress', () => {
  assert.match(script, /syllabuslaya:last-semester:/);
  assert.match(script, /function saveSemesterIndex\(/);
  assert.match(script, /function getSavedSemesterIndex\(/);
  assert.match(script, /getSavedSemesterIndex\(p,D\.length\)/);
  assert.match(script, /saveSemesterIndex\(prog,cur\)/);
});

test('last semester is restored for the same programme and defaults safely on invalid values', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  };
  const firstPage = createStorageApi(storage);
  firstPage.saveSemesterIndex('civil', 2);
  const reopenedPage = createStorageApi(storage);
  assert.equal(reopenedPage.getSavedSemesterIndex('civil', 6), 2);
  assert.equal(reopenedPage.getSavedSemesterIndex('civil', 2), 0);
  assert.equal(reopenedPage.getSavedSemesterIndex('mech', 6), 0);
  assert.equal(reopenedPage.semesterStorageKey('civil'), 'syllabuslaya:last-semester:civil');
});

test('semester storage gracefully handles blocked or full localStorage', () => {
  const storage = {
    getItem: () => { throw new Error('storage blocked'); },
    setItem: () => { throw new Error('storage full'); },
  };
  const api = createStorageApi(storage);
  assert.equal(api.saveSemesterIndex('civil', 3), false);
  assert.equal(api.getSavedSemesterIndex('civil', 6), 0);
});

test('keyboard focus remains visible on interactive controls', () => {
  assert.match(styles, /:focus-visible/);
});

test('small-screen layout has a responsive breakpoint', () => {
  assert.match(styles, /@media\s*\(max-width:\s*\d+px\)/);
});

test('reduced-motion preference disables nonessential transitions', () => {
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('inline JavaScript parses without syntax errors', () => {
  assert.notEqual(script, '', 'inline script exists');
  assert.doesNotThrow(() => new Function(script));
});
