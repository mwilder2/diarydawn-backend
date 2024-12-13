export function returnStringDateTimeZone(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    const dateTimeZone = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.${milliseconds}`;
    return dateTimeZone;
}

export function returnDefaultDate(): Date {
    const date = new Date('2000-01-01');
    return date;
}

export async function generateRandomNumber(): Promise<number> {
    const random = Math.floor(Math.random() * 1000000000);
    return random;
}

export async function generateRandomString(): Promise<string> {
    const random =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return random;
}

// Algorithm to find the closest match to a string
export async function levenshteinDistance(
    string: string,
    arrayElement: string,
) {
    const a = string.split('');
    const b = arrayElement.split('');
    const matrix = [];

    // Increment along the first column of each row
    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b[i - 1] == a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                // Substitution
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,

                    // Insertion
                    Math.min(
                        matrix[i][j - 1] + 1,

                        // Deletion
                        matrix[i - 1][j] + 1,
                    ),
                );
            }
        }
    }

    // Return the last value in the matrix
    return matrix[b.length][a.length];
}

// Function to utilize the Levenshtein Distance algorithm to find the closest match to a string with distance limit
export async function findClosestMatch(
    string: string,
    array: string[],
    distanceLimit: number,
): Promise<boolean> {
    let closestMatchDistance = 100;
    for (const arrayElement of array) {
        const distance = await levenshteinDistance(string, arrayElement);
        if (distance < closestMatchDistance) {
            closestMatchDistance = distance;
        }
    }
    if (closestMatchDistance <= distanceLimit) {
        return true;
    } else {
        return false;
    }
}

// Choose random word from a string array
export async function chooseRandomWord(array: string[]): Promise<string> {
    const randomWord = array[Math.floor(Math.random() * array.length)];
    return randomWord;
}

export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
