/**
 * MIT License

Copyright (c) 2022 KlaudSol Philippines, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**/


import EntityType from '@backend/models/core/EntityType';
import { withSession } from '@klaudsol/commons/lib/Session';
import { defaultErrorHandler } from '@klaudsol/commons/lib/ErrorHandler';
import { OK, NOT_FOUND } from '@klaudsol/commons/lib/HttpStatuses';
import { createHash } from '@/lib/Hash';
import { setCORSHeaders } from '@klaudsol/commons/lib/API';
import { readContentTypes, writeContentTypes } from '@/lib/Constants';
import { assert, assertUserCan } from "@klaudsol/commons/lib/Permissions";

export default withSession(handler);

async function handler(req, res) {
  
  try {
    switch(req.method) {
      case "GET":
        return await get(req, res); 
      case "POST":
        return await create(req, res);
      default:
        throw new Error(`Unsupported method: ${req.method}`);
    }
  } catch (error) {
    await defaultErrorHandler(error, req, res);
  }
}

  async function get(req, res) { 
    try{

      await assertUserCan(readContentTypes, req);

      const entityTypes = await EntityType.all();
      const output = {
        data: entityTypes,
        metadata: {}
      }
      
      output.metadata.hash = createHash(output);
      
      setCORSHeaders({response: res, url: process.env.FRONTEND_URL});
      entityTypes ? res.status(OK).json(output ?? []) : res.status(NOT_FOUND).json({})
    }
    catch (error) {
      await defaultErrorHandler(error, req, res);
    }
  }

  async function create(req, res) { 
    try{

      await assert({
        loggedIn: true,
      }, req);

      await assertUserCan(readContentTypes, req) &&
      await assertUserCan(writeContentTypes, req);

      const { name, slug, icon } = req.body;
      await EntityType.create({ name, slug, icon });
      const output = {
        data: { name, slug, icon },
        metadata: {}
      }
      
      output.metadata.hash = createHash(output);
      
      setCORSHeaders({response: res, url: process.env.FRONTEND_URL});
      res.status(OK).json(output ?? []);
      //entityTypes ? res.status(OK).json(output ?? []) : res.status(NOT_FOUND).json({})
    }
    catch (error) {
      await defaultErrorHandler(error, req, res);
    }
  }
