# steffen phillip
import logging
import json
import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    data = req.get_json()
    
    accountAmount = float(data.get('accountAmount'))
    loanAmount = float(data.get('loanAmount'))

    print(accountAmount)
    print(loanAmount)
    if loanAmount > accountAmount:
        return func.HttpResponse(body=json.dumps({"Response":"Bad request"}),status_code=403)
    else:
        return func.HttpResponse(body=json.dumps({"Response":"Request successful"}),status_code=200)