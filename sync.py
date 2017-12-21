from pptx import Presentation
from pprint import pprint
import json

import time, threading
def foo():
    print(time.ctime())

    data = json.load(open('data.json'))
    pprint(data)

    prs = Presentation('template.pptx')

    prs.slides[0].shapes.placeholders[0].text = data["title"]
    prs.slides[0].shapes.placeholders[1].text = data["content"]

    prs.save('test.pptx')

    threading.Timer(2, foo).start()

foo()

