// import './css/styles.css';
import { Notify } from "notiflix";
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31301300-300be7510f84e8e4ecf9762e9';
const PIC_PER_PAGE = 40;
const SAFESEARCH = 'true';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';

const formEl = document.querySelector('#search-form')
const inputEl = document.querySelector('[name="searchQuery"]');
const submitBtn = document.querySelector('[type="submit"]');
const loadBtn = document.querySelector('[type="button"]');
const galleryEl = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });



let page = 1;
let request = '';

submitBtn.addEventListener('click', onSubmit);
loadBtn.addEventListener('click', onLoadMore);


function onSubmit(event) {
    event.preventDefault();
    page = 1;
    request = inputEl.value;

    if (request === '') {
        Notify.info('What exactly do we search?');
        hideLoadBtn();
        
    } else {
        showResult()
        formEl.reset();
    }
}

function onLoadMore() {
    page += 1;
    showResult();
    
}

async function fetchPics() {

        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: request,
                image_type: IMAGE_TYPE,
                page: page,
                per_page: PIC_PER_PAGE,
                safesearch: SAFESEARCH,
                orientation: ORIENTATION
            }
        })
        const data = response.data;
        return data;
}


async function showResult() {
    try {
        const data = await fetchPics();
        const resultEl = await renderMarkup(data);
        galleryEl.insertAdjacentHTML('beforeend', resultEl);
        lightbox.refresh();
     
    } catch (error) {
        Notify.failure('Oops, something went wrong! We are working hard to fix it!');
    }    
}


function renderMarkup(data) {
        let { hits, total, totalHits } = data;
        if (page > 1) {
            showLoadmoreNotify(hits.length);
        } else {
            showSubmitNotify(totalHits, hits.length);
            clearResultField();
        }

        const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
            
            
            <div class="photo-card">
                <div class="thumb"><a class="gallery__item" href="${largeImageURL}">
                    <img class="gallery__image"src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
                </div>
                <div class="info">
                    <p class="info-item">
                        
                        <b>${likes}</b>
                    </p>
                    <p class="info-item">
                        
                        <b>${views}</b>
                        </p>
                    <p class="info-item">
                        
                        <b>${comments}</b>
                    </p>
                    <p class="info-item">
                        
                        <b>${downloads}</b>
                    </p>
                </div>
            </div>
                `).join("");
        return markup;
    }

function clearResultField() {
    galleryEl.innerHTML = "";
}

function showLoadBtn() {
    loadBtn.classList.remove("visually-hidden")
}

function hideLoadBtn() {
    loadBtn.classList.add("visually-hidden");
}

function showSubmitNotify(totalHits, arrLength) {
    if (arrLength === 0) {
        hideLoadBtn();
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        
    } else {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        showLoadBtn()
    }
}

function showLoadmoreNotify(arrLength) {
    if (arrLength < PIC_PER_PAGE) {
        hideLoadBtn();
        Notify.warning("We're sorry, but you've reached the end of search results.");
    }
}