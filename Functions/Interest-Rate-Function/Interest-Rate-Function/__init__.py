# steffen phillip
import logging
import json

import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    amount = req.params.get('amount')

    if not amount:
        try:
            req_body = req.get_json()
        except ValueError:
            print('Received an invalid value')
            pass
        else:
            amount = req_body.get('amount')

    if amount:
        interest_amount = float(amount) * 1.02
        return func.HttpResponse(body=json.dumps({"interest_amount":interest_amount}))
    else:
        return func.HttpResponse("Invalid input",status_code=400)
