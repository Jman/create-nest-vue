import { ref } from 'vue';
import { defineStore } from 'pinia';

export const usePagesStore = defineStore('pages', () => {
  const content = ref('');

  async function loadPage() {
    const response = await fetch('/api/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (response.ok && response.status >= 200 && response.status < 300) {
      const { message } = await response.json();
      content.value = message;
    } else {
      throw new Error(response.statusText);
    }
  }

  return { content, loadPage };
});
