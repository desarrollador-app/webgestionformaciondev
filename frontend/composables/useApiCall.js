import { ref } from 'vue';

export function useApiCall(apiFunction) {
	const loading = ref(false);
	const error = ref('');
	const data = ref(null);

	const call = async () => {
		loading.value = true;
		error.value = '';
		data.value = null;

		try {
			const response = await apiFunction();
			data.value = response;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error.value = errorMessage;
			console.error(errorMessage);
		} finally {
			loading.value = false;
		}
	};

	return {
		loading,
		error,
		data,
		call,
	};
}
