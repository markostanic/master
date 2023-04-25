import random
import string


def get_random_string(length) -> str:
    letters = string.ascii_letters
    result_str = ''.join(random.choice(letters) for _ in range(length))
    return result_str
